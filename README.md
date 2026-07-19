# RAG Chatbot

A Retrieval-Augmented Generation chatbot that answers questions based on uploaded documents. Instead of relying on pre-trained knowledge, the chatbot retrieves relevant information from your documents and generates accurate, context-grounded responses.

## How RAG Works

1. **Document Chunking** -- The uploaded document is split into smaller, overlapping text chunks for efficient processing.
2. **Embedding Generation** -- Each chunk is converted into a numerical vector (embedding) that captures its semantic meaning, using a local transformer model.
3. **Vector Storage** -- Embeddings are stored in an in-memory vector store for fast retrieval.
4. **Semantic Search** -- When a user asks a question, the question is also converted to a vector. The system finds the most similar document chunks using cosine similarity.
5. **Response Generation** -- The most relevant chunks are sent to Claude as context, along with the user's question. Claude generates an answer strictly from the provided context. If the answer isn't in the documents, it says so.

## Tech Stack

- **Backend:** Node.js, Express
- **AI Model:** Anthropic Claude (claude-sonnet-4-6) via `@anthropic-ai/sdk`
- **Embeddings:** Local generation with Transformers.js (`all-MiniLM-L6-v2`, 384 dimensions)
- **Vector Store:** In-memory with cosine similarity search
- **Frontend:** Vanilla HTML/CSS/JS with dark theme and streaming responses
- **File Upload:** Multer for document processing

## Getting Started

### Prerequisites

- Node.js v18+
- Anthropic API key

### Installation

```bash
git clone https://github.com/tomasko-has/RAG.git
cd RAG
npm install
```

Create a `.env` file in the root directory:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### Running

```bash
node server.js
```

Open `http://localhost:3000` in your browser.

## Usage

1. The chatbot loads with a sample restaurant document by default.
2. Ask questions about the loaded document in the chat.
3. Upload your own `.txt` file using the upload button to replace the document.
4. The chatbot will only answer from the document content -- if the answer isn't there, it will tell you.

## Customization

- **Chunk size & overlap:** Adjust `maxChunkSize` and `overlap` in `chunker.js`
- **Number of retrieved chunks:** Change `topK` parameter in `vectorStore.js` `search()` function
- **AI model:** Change the model in `rag.js`
- **Port:** Set `PORT` environment variable (defaults to 3000)
