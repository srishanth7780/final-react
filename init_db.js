import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSeeds } from './src/constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const itemsFile = path.join(dataDir, 'items.json');
const items = generateSeeds();

fs.writeFileSync(itemsFile, JSON.stringify(items, null, 2));
console.log('Successfully created data/items.json');
