import 'dotenv/config';
import express from 'express';
import { readFileSync } from 'fs';
import multer from 'multer';
import { chunkText } from './chunker.js';
import { addChunks, clearStore } from './vectorStore.js';
import { askStream } from './rag.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Multer — ukladá nahrané súbory do pamäte (nie na disk)
const upload = multer({ storage: multer.memoryStorage() });

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
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error.message);
    res.write(`data: ${JSON.stringify({ error: 'Something went wrong' })}\n\n`);
    res.end();
  }
});

// Upload endpoint — nahrá dokument a spracuje ho do RAG pipeline
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Prečítame obsah súboru ako text (odstránime BOM ak existuje)
    const fileText = req.file.buffer.toString('utf-8').replace(/^\uFEFF/, '');

    if (!fileText.trim()) {
      return res.status(400).json({ error: 'File is empty' });
    }

    // Vyčistíme starý vector store a nahráme nový dokument
    clearStore();
    const newChunks = chunkText(fileText);

    if (newChunks.length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    await addChunks(newChunks);

    res.json({
      success: true,
      filename: req.file.originalname,
      chunks: newChunks.length
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
