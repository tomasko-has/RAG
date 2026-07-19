// embeddings.js — Generuje vektory (embeddings) z textov pomocou lokálneho modelu
// Používame Transformers.js — beží priamo v Node.js, nepotrebuje API kľúč
// Model: all-MiniLM-L6-v2 — malý (30MB), rýchly, produkuje 384-dimenzionálne vektory

import { pipeline } from '@xenova/transformers';

// Singleton — model sa načíta len raz, potom sa reuse-uje
let embedder = null;

/**
 * Načíta embedding model (pri prvom volaní stiahne ~30MB model)
 * Pipeline 'feature-extraction' = z textu vyrobí vektor
 */
async function getEmbedder() {
  if (!embedder) {
    console.log('Loading embedding model (first time may take a moment)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded.');
  }
  return embedder;
}

/**
 * Vygeneruje embedding (vektor) pre jeden text
 * @param {string} text - vstupný text
 * @returns {number[]} vektor s 384 číslami
 */
export async function embed(text) {
  const model = await getEmbedder();
  // Model vráti tensor — my chceme obyčajné pole čísel
  // mean pooling = spriemeruje vektory všetkých tokenov do jedného vektora
  const result = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

/**
 * Vygeneruje embeddings pre pole textov
 * @param {string[]} texts - pole textov
 * @returns {number[][]} pole vektorov
 */
export async function embedMany(texts) {
  const vectors = [];
  for (const text of texts) {
    vectors.push(await embed(text));
  }
  return vectors;
}
