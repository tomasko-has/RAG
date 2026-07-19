import 'dotenv/config';
import express from 'express';
import { readFileSync } from 'fs';
import { chunkText } from './chunker.js';
import { addChunks } from './vectorStore.js';
import { askStream } from './rag.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Pri štarte servera načítame sample dokument do vector store
const text = readFileSync('./sample.txt', 'utf-8');
const chunks = chunkText(text);
await addChunks(chunks);

// Chat endpoint — streaming odpoveď cez Server-Sent Events (SSE)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // SSE hlavičky — prehliadač dostáva odpoveď po kúskoch
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await askStream(message, (chunk) => {
      // Každý kúsok textu pošleme ako SSE event
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });
    // Signál že stream skončil
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error.message);
    res.write(`data: ${JSON.stringify({ error: 'Something went wrong' })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
