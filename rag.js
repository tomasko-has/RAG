// rag.js — Hlavný RAG modul: spája vyhľadávanie s Claude API
// Flow: otázka → nájdi relevantné chunky → pošli Claude ako kontext → odpoveď

import Anthropic from '@anthropic-ai/sdk';
import { search } from './vectorStore.js';

const anthropic = new Anthropic();

// System prompt — KĽÚČOVÝ pre RAG: prikazuje Claude odpovedať LEN z kontextu
const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based ONLY on the provided context.

Rules:
- Answer ONLY using information from the context below.
- If the answer is not in the context, say "I don't have that information in the provided documents."
- Do NOT make up information or use knowledge from your training.
- Be concise and helpful.
- If the context contains relevant information, quote specific details (prices, times, etc.).`;

/**
 * Spracuje otázku cez RAG pipeline (bez streamingu — pre testovanie)
 * @param {string} question - otázka od používateľa
 * @returns {string} odpoveď od Claude
 */
export async function ask(question) {
  // 1. Nájdi relevantné chunky
  const results = await search(question, 3);
  const context = results.map(r => r.text).join('\n\n---\n\n');

  // 2. Pošli Claude: system prompt + kontext + otázku
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ]
  });

  return response.content[0].text;
}

/**
 * Spracuje otázku so streamingom (pre frontend)
 * @param {string} question - otázka od používateľa
 * @param {function} onChunk - callback volaný s každým kúskom odpovede
 */
export async function askStream(question, onChunk) {
  // 1. Nájdi relevantné chunky
  const results = await search(question, 3);
  const context = results.map(r => r.text).join('\n\n---\n\n');

  // 2. Stream odpoveď od Claude
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ]
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text);
    }
  }
}
