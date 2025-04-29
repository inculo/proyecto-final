const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');

sendBtn.addEventListener('click', () => {
  const messageText = userInput.value.trim();
  if (messageText !== "") {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'user');
    messageDiv.innerText = messageText;
    chatMessages.appendChild(messageDiv);
    userInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// Permitir enviar con Enter
userInput.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
