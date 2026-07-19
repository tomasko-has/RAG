// chunker.js — Rozseká dokument na menšie kúsky pre RAG pipeline
// Stratégia: delíme podľa odstavcov (prázdny riadok = hranica)
// Ak je odstavec príliš dlhý, rozdelíme ho ďalej podľa viet

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

  // Rozdelíme podľa prázdnych riadkov (odstavcov)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // Ak by pridanie odstavca prekročilo limit, uložíme aktuálny chunk
    if (currentChunk && (currentChunk.length + paragraph.length + 1) > maxChunkSize) {
      chunks.push(currentChunk.trim());

      // Overlap — vezmeme koniec aktuálneho chunku ako začiatok nového
      // Nájdeme poslednú vetu v rámci overlap dĺžky
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n' + paragraph;
    } else {
      // Pridáme odstavec do aktuálneho chunku
      currentChunk = currentChunk ? currentChunk + '\n' + paragraph : paragraph;
    }
  }

  // Nezabudnúť na posledný chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
