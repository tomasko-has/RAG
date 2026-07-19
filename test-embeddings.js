// Test — vygenerujeme embeddings pre naše chunky a overíme že fungujú
import { readFileSync } from 'fs';
import { chunkText } from './chunker.js';
import { embed, embedMany } from './embeddings.js';

const text = readFileSync('./sample.txt', 'utf-8');
const chunks = chunkText(text);

console.log(`Generujem embeddings pre ${chunks.length} kúskov...\n`);

const vectors = await embedMany(chunks);

// Ukážme prvý vektor — len prvých 10 čísel pre prehľadnosť
console.log(`Každý vektor má ${vectors[0].length} dimenzií`);
console.log(`Prvý vektor (prvých 10 čísel): [${vectors[0].slice(0, 10).map(n => n.toFixed(4)).join(', ')}...]`);
console.log(`\nVšetkých ${vectors.length} vektorov úspešne vygenerovaných!`);
