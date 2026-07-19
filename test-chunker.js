// Jednoduchý test — spustíme chunker a vypíšeme výsledky
import { readFileSync } from 'fs';
import { chunkText } from './chunker.js';

const text = readFileSync('./sample.txt', 'utf-8');
const chunks = chunkText(text);

console.log(`Dokument má ${text.length} znakov`);
console.log(`Rozsekaný na ${chunks.length} kúskov\n`);

chunks.forEach((chunk, i) => {
  console.log(`--- Chunk ${i + 1} (${chunk.length} znakov) ---`);
  console.log(chunk);
  console.log('');
});
