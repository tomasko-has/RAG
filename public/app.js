const chat = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');
const uploadStatus = document.getElementById('upload-status');

// File upload handler
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  uploadStatus.textContent = 'Processing...';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      uploadStatus.textContent = `"${data.filename}" loaded (${data.chunks} chunks)`;
      addMessage(`Document "${data.filename}" uploaded and processed. You can now ask questions about it.`, 'assistant');
    } else {
      uploadStatus.textContent = data.error || 'Upload failed';
    }
  } catch (error) {
    console.error('Upload error:', error);
    uploadStatus.textContent = 'Upload failed: ' + error.message;
  }

  // Reset input aby sa dal nahrať ten istý súbor znova
  fileInput.value = '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  // Pridaj user správu do chatu
  addMessage(message, 'user');
  input.value = '';
  sendBtn.disabled = true;

  // Vytvor prázdnu assistant správu (budeme do nej streamovať)
  const assistantMsg = addMessage('', 'assistant');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    // Čítame SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Spracuj všetky kompletné SSE eventy v bufferi
      const lines = buffer.split('\n');
      buffer = lines.pop(); // posledný nekompletný riadok nechaj v bufferi

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.text) {
            assistantMsg.textContent += data.text;
          }
          if (data.error) {
            assistantMsg.textContent = 'Error: ' + data.error;
          }
        }
      }

      // Auto-scroll dolu
      chat.scrollTop = chat.scrollHeight;
    }
  } catch (error) {
    assistantMsg.textContent = 'Error: Could not connect to server.';
  }

  sendBtn.disabled = false;
  input.focus();
});

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role}`;

  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;

  div.appendChild(content);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  return content;
}
