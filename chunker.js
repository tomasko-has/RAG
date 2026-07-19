// chunker.js — Rozseká dokument na menšie kúsky pre RAG pipeline
// Stratégia: najprv skúsi deliť podľa prázdnych riadkov (odstavcov)
// Ak to nevyjde, delí podľa jednotlivých riadkov
// Ak je text bez riadkov, delí podľa viet

/**
 * Rozseká text na kúsky (chunks) vhodné pre embedding
 * @param {string} text - celý dokument
 * @param {object} options - nastavenia
 * @param {number} options.maxChunkSize - max počet znakov na kúsok (default 500)
 * @param {number} options.overlap - počet znakov prekrytia medzi kúskami (default 50)
 * @returns {string[]} pole kúskov
 */
export function chunkText(text, options = {}) {
  const { maxChunkSize = 500, overlap = 50 } = options;

  // Vyčistíme text
  const cleanText = text.trim();
  if (!cleanText) return [];

  // Skúsime rozdeliť podľa prázdnych riadkov (odstavcov)
  let parts = cleanText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Ak máme len 1 veľký blok, skúsime deliť podľa jednotlivých riadkov
  if (parts.length === 1 && parts[0].length > maxChunkSize) {
    parts = cleanText
      .split(/\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  // Ak stále máme len 1 veľký blok, delíme podľa viet
  if (parts.length === 1 && parts[0].length > maxChunkSize) {
    parts = cleanText
      .split(/(?<=[.!?])\s+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  // Skladáme kúsky dohromady do chunkov s max veľkosťou
  const chunks = [];
  let currentChunk = '';

  for (const part of parts) {
    if (currentChunk && (currentChunk.length + part.length + 1) > maxChunkSize) {
      chunks.push(currentChunk.trim());

      // Overlap — vezmeme koniec aktuálneho chunku ako začiatok nového
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n' + part;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n' + part : part;
    }
  }

  // Nezabudnúť na posledný chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
