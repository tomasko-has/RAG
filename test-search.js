// Test — nahráme dokument do vector store a skúsime vyhľadávanie
import { readFileSync } from 'fs';
import { chunkText } from './chunker.js';
import { addChunks, search } from './vectorStore.js';

// 1. Načítame a rozchunkujeme dokument
const text = readFileSync('./sample.txt', 'utf-8');
const chunks = chunkText(text);

// 2. Pridáme do vector store (vygeneruje embeddings)
await addChunks(chunks);

// 3. Skúsime rôzne otázky
const questions = [
  'How much does pizza cost?',
  'What are the opening hours?',
  'Do you have gluten-free options?',
  'What desserts do you have?'
];

console.log('\n--- Sémantické vyhľadávanie ---\n');

for (const question of questions) {
  console.log(`OTÁZKA: "${question}"`);
  const results = await search(question, 2); // top 2 výsledky
  results.forEach((r, i) => {
    console.log(`  #${i + 1} (skóre: ${r.score.toFixed(4)}): ${r.text.substring(0, 100)}...`);
  });
  console.log('');
}
