// vectorStore.js — In-memory úložisko vektorov + sémantické vyhľadávanie
// Ukladá chunky aj ich vektory, pri otázke nájde najpodobnejšie

import { embed, embedMany } from './embeddings.js';

/**
 * Cosine similarity medzi dvoma vektormi
 * Keďže naše vektory sú normalizované (veľkosť = 1),
 * cosine similarity = skalárny súčin (dot product)
 * @param {number[]} a - prvý vektor
 * @param {number[]} b - druhý vektor
 * @returns {number} podobnosť od -1 do 1 (vyššie = podobnejšie)
 */
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }
  return dotProduct;
}

// Úložisko — pole objektov { text, vector }
let store = [];

/**
 * Pridá chunky do úložiska — vygeneruje pre ne embeddings a uloží
 * @param {string[]} chunks - pole textových kúskov
 */
export async function addChunks(chunks) {
  const vectors = await embedMany(chunks);
  for (let i = 0; i < chunks.length; i++) {
    store.push({ text: chunks[i], vector: vectors[i] });
  }
}

/**
 * Vyhľadá najpodobnejšie chunky k otázke
 * @param {string} query - otázka od používateľa
 * @param {number} topK - koľko výsledkov vrátiť (default 3)
 * @returns {Array<{text: string, score: number}>} najrelevantnejšie kúsky so skóre
 */
export async function search(query, topK = 3) {
  // 1. Prevedieme otázku na vektor
  const queryVector = await embed(query);

  // 2. Porovnáme s každým uloženým chunkom
  const results = store.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.vector)
  }));

  // 3. Zoradíme od najvyššieho skóre a vrátime top K
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

/**
 * Vymaže celé úložisko (užitočné pri nahrávaní nového dokumentu)
 */
export function clearStore() {
  store = [];
}
