/* eslint-disable */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Configuration ───
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BACKEND_URL = 'http://127.0.0.1:3001/api/chat';
const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3-flash'];
const SYSTEM_PROMPT = 'You are a helpful, friendly AI assistant for a campus bidding platform. Keep responses concise, engaging, and helpful. You can assist with questions about products, bidding, account issues, and general queries.';

// ─── Water Wave Animation ───
const WaterWave = ({ className = "" }) => (
  <div className={`absolute bottom-0 left-0 right-0 overflow-hidden ${className}`}>
    <svg className="relative w-[200%] h-12 animate-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-cyan-400/20" />
    </svg>
    <svg className="absolute bottom-0 w-[200%] h-12 animate-wave-slow" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-blue-500/10" />
    </svg>
  </div>
);

// ─── Glass Bubble ───
const GlassBubble = ({ delay = 0, size = "w-2 h-2" }) => {
  const [animConfig, setAnimConfig] = useState(null);

  useEffect(() => {
    setAnimConfig({
      x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
      duration: 8 + Math.random() * 4,
      left: `${Math.random() * 100}%`
    });
  }, []);

  if (!animConfig) return null;

  return (
    <motion.div
      className={`absolute rounded-full ${size} bg-gradient-to-br from-cyan-300/20 to-blue-500/10 backdrop-blur-sm border border-white/10`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: [-20, -100, -150], x: animConfig.x, opacity: [0, 0.6, 0], scale: [0.5, 1, 0.3] }}
      transition={{ duration: animConfig.duration, repeat: Infinity, delay, ease: "easeInOut" }}
      style={{ left: animConfig.left, bottom: 0 }}
    />
  );
};

// ─── Message Bubble ───
const ChatMessage = ({ message, isBot, index }) => {
  const isStreaming = message.isStreaming;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`flex items-end gap-2 ${isBot ? 'flex-row' : 'flex-row-reverse'} mb-4`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 ${isBot ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20' : 'bg-gradient-to-br from-purple-500/20 to-pink-600/20'}`}
      >
        {isBot ? <Bot size={16} className="text-cyan-300" /> : <User size={16} className="text-pink-300" />}
      </motion.div>
      
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg ${isBot ? 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-bl-sm text-black' : 'bg-gradient-to-br from-cyan-600/30 to-blue-700/30 rounded-br-sm text-black'}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}{isStreaming && <span className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400 animate-pulse align-middle" />}</p>
        <span className="text-[10px] opacity-40 mt-1 block">{message.timestamp}</span>
      </div>
    </motion.div>
  );
};

// ─── Typing Indicator ───
const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-bl-sm w-fit">
    {[0, 0.2, 0.4].map((delay) => (
      <motion.div key={delay} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }} className="w-2 h-2 rounded-full bg-cyan-400" />
    ))}
  </motion.div>
);

// ─── Direct Gemini Client-Side Call (fallback when backend is down) ───
async function callGeminiDirect(messages, userText, onChunk) {
  if (!GEMINI_API_KEY) {
    throw new Error('No API key configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  // Build history from previous messages (skip system & the current user msg)
  const chatMessages = messages.filter(m => !m.isStreaming);
  let history = chatMessages.slice(0, -1)
    .filter(m => m.text && m.text.trim())
    .map(m => ({
      role: m.isBot ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

  // Gemini requires history to start with 'user' role
  while (history.length > 0 && history[0].role === 'model') {
    history.shift();
  }

  // Ensure alternating roles
  const cleanHistory = [];
  for (const msg of history) {
    if (cleanHistory.length === 0 || cleanHistory[cleanHistory.length - 1].role !== msg.role) {
      cleanHistory.push(msg);
    }
  }

  const prompt = `Instruction: ${SYSTEM_PROMPT}\n\nUser: ${userText}`;
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(`[Direct] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        history: cleanHistory,
        generationConfig: { maxOutputTokens: 1000 },
      });

      const result = await chat.sendMessageStream(prompt);
      let fullText = '';

      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullText += text;
        onChunk(fullText);
      }

      console.log(`[Direct] ✓ Success with model: ${modelName}`);
      return fullText;
    } catch (err) {
      lastError = err;
      console.warn(`[Direct] ✗ Model ${modelName} failed:`, err.message);
      if (err.status === 429 || err.status === 404 || err.message?.includes('429') || err.message?.includes('404') || err.message?.includes('quota') || err.message?.includes('not found')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All models exhausted. Please wait a minute and try again.');
}


// ─── Main ChatBot Component ───
const GlassWaterChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant powered by Gemini. Ask me anything about campus bidding or anything else! 🌊",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionMode, setConnectionMode] = useState('auto'); // 'auto' | 'backend' | 'direct'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);

  // ─── STREAMING GEMINI API CALL ───
  const sendMessageToGemini = useCallback(async (userText) => {
    setIsLoading(true);
    setError(null);

    // Add streaming bot message placeholder
    const botMessageId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        text: '',
        isBot: true,
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    abortControllerRef.current = new AbortController();

    // Strategy: Try backend first, fall back to direct client-side calls
    let backendSuccess = false;

    if (connectionMode !== 'direct') {
      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages.filter(m => !m.isStreaming).map(m => ({
                role: m.isBot ? 'assistant' : 'user',
                content: m.text,
              })),
              { role: 'user', content: userText },
            ],
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                // Check for streamed errors
                if (parsed.error) {
                  throw new Error(parsed.error.message);
                }
                const content = parsed.choices?.[0]?.delta?.content || '';
                fullText += content;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: fullText }
                      : msg
                  )
                );
              } catch (parseErr) {
                if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
              }
            }
          }
        }

        backendSuccess = true;
        setConnectionMode('backend');

        // Mark streaming as complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
          )
        );

      } catch (err) {
        if (err.name === 'AbortError') {
          setMessages((prev) => prev.filter(m => m.id !== botMessageId));
          setIsLoading(false);
          return;
        }
        console.warn('Backend failed, falling back to direct Gemini call:', err.message);
        // Don't set error yet — try direct mode
      }
    }

    // Fallback: Direct client-side Gemini call
    if (!backendSuccess) {
      try {
        console.log('Using direct Gemini API call...');
        setConnectionMode('direct');

        await callGeminiDirect(
          [...messages, { id: Date.now(), text: userText, isBot: false }],
          userText,
          (fullText) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, text: fullText }
                  : msg
              )
            );
          }
        );

        // Mark streaming as complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
          )
        );

      } catch (err) {
        if (err.name === 'AbortError') {
          setMessages((prev) => prev.filter(m => m.id !== botMessageId));
        } else {
          let friendlyMsg = err.message;
          if (err.message?.includes('429') || err.message?.includes('quota')) {
            friendlyMsg = '⏳ Rate limit reached. Your free-tier quota has been exhausted. Please wait a few minutes and try again.';
          }
          setError(friendlyMsg);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: `Sorry, I couldn't process that request. ${friendlyMsg}`, isStreaming: false }
                : msg
            )
          );
        }
      }
    }

    setIsLoading(false);
  }, [messages, connectionMode]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    const textToSend = inputValue.trim();
    setInputValue('');
    sendMessageToGemini(textToSend);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const connectionLabel = connectionMode === 'backend' ? 'Backend' : connectionMode === 'direct' ? 'Direct' : 'Auto';

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <style>{`
        @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes wave-slow { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .animate-wave { animation: wave 15s linear infinite; }
        .animate-wave-slow { animation: wave-slow 20s linear infinite; }
        .glass-scrollbar::-webkit-scrollbar { width: 6px; }
        .glass-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .glass-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .glass-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[400px] h-[600px] rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-950/95 backdrop-blur-xl" />
            
            {/* Bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <GlassBubble key={i} delay={i * 1.5} size={i % 2 === 0 ? "w-3 h-3" : "w-2 h-2"} />
              ))}
            </div>

            <WaterWave className="z-0" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 flex items-center justify-center border border-cyan-400/30 shadow-lg shadow-cyan-500/20"
                  >
                    <Sparkles size={20} className="text-cyan-300" />
                  </motion.div>
                  <div>
                    <h3 className="text-black font-semibold text-sm">Gemini Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                      <span className="text-xs text-black/60">{isLoading ? 'Thinking...' : `Ready • ${connectionLabel}`}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-black/10 transition-colors text-black/60 hover:text-black"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 flex items-center gap-2 cursor-pointer"
                    onClick={() => setError(null)}
                  >
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300 flex-1">{error}</p>
                    <span className="text-xs text-red-400/60">✕</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 glass-scrollbar space-y-1">
                {messages.map((msg, index) => (
                  <ChatMessage key={msg.id} message={msg} isBot={msg.isBot} index={index} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-white/10 bg-gradient-to-t from-slate-900/50 to-transparent backdrop-blur-md">
                <div className="flex items-end gap-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-2 focus-within:border-cyan-400/30 focus-within:bg-white/10 transition-all duration-300">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    rows={1}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-black placeholder-black/40 text-sm resize-none outline-none px-2 py-2 max-h-24 disabled:opacity-50"
                    style={{ minHeight: '20px' }}
                  />
                  {isLoading ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleStop}
                      className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                    >
                      <div className="w-[18px] h-[18px] rounded-sm bg-red-400" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className={`p-3 rounded-xl transition-all duration-300 ${inputValue.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/25' : 'bg-black/5 text-black/40 cursor-not-allowed'}`}
                    >
                      <Send size={18} />
                    </motion.button>
                  )}
                </div>
                <p className="text-center text-[10px] text-black/50 mt-2">
                  Powered by Gemini AI • Streaming enabled • Auto-fallback
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={24} className="text-cyan-300" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
                <MessageCircle size={24} className="text-cyan-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isOpen && messages.length > 1 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-[10px] text-black font-bold flex items-center justify-center border-2 border-slate-900 shadow-lg">
            {messages.length - 1}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default function App() {
  return (
    
    <GlassWaterChatBot />

  );
}