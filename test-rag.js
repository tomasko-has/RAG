// Test — end-to-end RAG: načítame dokument, spýtame sa, overíme odpovede
import 'dotenv/config';
import { readFileSync } from 'fs';
import { chunkText } from './chunker.js';
import { addChunks } from './vectorStore.js';
import { ask } from './rag.js';

// 1. Načítame a spracujeme dokument
const text = readFileSync('./sample.txt', 'utf-8');
const chunks = chunkText(text);
await addChunks(chunks);

console.log('\n--- RAG Test ---\n');

// 2. Otázka na ktorú dokument OBSAHUJE odpoveď
console.log('Q: How much does the Margherita pizza cost?');
const answer1 = await ask('How much does the Margherita pizza cost?');
console.log(`A: ${answer1}\n`);

// 3. Otázka na ktorú dokument NEOBSAHUJE odpoveď — musí priznať že nevie
console.log('Q: What is the WiFi password?');
const answer2 = await ask('What is the WiFi password?');
console.log(`A: ${answer2}\n`);

// 4. Ešte jedna otázka z dokumentu
console.log('Q: Do you offer delivery? What is the minimum order?');
const answer3 = await ask('Do you offer delivery? What is the minimum order?');
console.log(`A: ${answer3}\n`);
