import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ITEMS_FILE = path.join(__dirname, 'data', 'items.json');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Model fallback chain — if one model's quota is exhausted, try the next
const MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3-flash',
];

// ─── Attempt streaming with a single model ───
async function tryModelStream(genAI, modelName, history, prompt, generationConfig) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const chat = model.startChat({ history, generationConfig });
  const result = await chat.sendMessageStream(prompt);
  return { result, modelName };
}

// ─── Main chat endpoint ───
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return res.status(500).json({ 
        error: { message: "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file." } 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Convert OpenAI-style messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system')?.content || "";
    const chatMessages = messages.filter(m => m.role !== 'system');
    
    let history = chatMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Gemini requirement: History must start with the 'user' role.
    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }
    
    const userMessage = chatMessages[chatMessages.length - 1].content;
    const prompt = systemMessage ? `Instruction: ${systemMessage}\n\nUser: ${userMessage}` : userMessage;

    const generationConfig = { maxOutputTokens: 1000 };

    // Try each model in the chain until one works
    let streamResult = null;
    let lastError = null;
    let usedModel = '';

    for (const modelName of MODEL_CHAIN) {
      try {
        console.log(`Trying model: ${modelName}`);
        const { result, modelName: mn } = await tryModelStream(genAI, modelName, history, prompt, generationConfig);
        streamResult = result;
        usedModel = mn;
        console.log(`✓ Using model: ${modelName}`);
        break;
      } catch (err) {
        lastError = err;
        console.warn(`✗ Model ${modelName} failed: ${err.status || err.message}`);
        // If it's a quota error (429) or model not found (404), try next model
        if (err.status === 429 || err.status === 404 || err.message?.includes('429') || err.message?.includes('404') || err.message?.includes('quota')) {
          continue;
        }
        // For non-recoverable errors, throw immediately
        throw err;
      }
    }

    if (!streamResult) {
      throw lastError || new Error('All models exhausted. Please wait and try again.');
    }

    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Tell the client which model is being used
    res.setHeader('X-Model-Used', usedModel);

    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text();
      // Format as OpenAI-style SSE so the existing frontend logic works perfectly
      const sseData = {
        choices: [{
          delta: { content: chunkText }
        }]
      };
      res.write(`data: ${JSON.stringify(sseData)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error in Gemini chat:', error.message || error);
    const errorMsg = error.message || "An unknown error occurred";
    
    // Provide a user-friendly message for quota errors
    let friendlyMsg = errorMsg;
    if (errorMsg.includes('429') || errorMsg.includes('quota')) {
      friendlyMsg = "All Gemini models are rate-limited. Please wait a minute and try again. Your free-tier daily quota may have been exceeded.";
    }
    
    if (!res.headersSent) {
      res.status(500).json({ error: { message: friendlyMsg } });
    } else {
      res.write(`data: ${JSON.stringify({ error: { message: friendlyMsg } })}\n\n`);
      res.end();
    }
  }
});

// ─── Items API Endpoints ───
const getItems = () => {
  try {
    const data = fs.readFileSync(ITEMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveItems = (items) => {
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
};

app.get('/api/items', (req, res) => {
  res.json(getItems());
});

app.post('/api/items', (req, res) => {
  const items = getItems();
  const newItem = req.body;
  items.unshift(newItem);
  saveItems(items);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const items = getItems();
  const index = items.findIndex(item => item.id === req.params.id);
  if (index !== -1) {
    items[index] = req.body;
    saveItems(items);
    res.json(items[index]);
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', models: MODEL_CHAIN });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend server (Gemini) running on http://127.0.0.1:${PORT}`);
  console.log(`Model fallback chain: ${MODEL_CHAIN.join(' → ')}`);
});
