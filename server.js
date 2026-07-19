import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pre parsovanie JSON requestov
app.use(express.json());

// Testovací endpoint — overíme že server beží
app.get('/', (req, res) => {
  res.json({ message: 'RAG Chatbot API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
