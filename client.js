const socket = io();

const messagesDiv = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const usernameModal = document.getElementById('username-modal');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const usersList = document.getElementById('users-list');

let username;

// Handle username submission
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('new-user', username);
        usernameModal.style.display = 'none';
        messageInput.focus();
    }
});

// Handle sending messages
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        messageInput.value = '';
    }
});

// Handle receiving messages
socket.on('chat-message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(data.username === username ? 'sent' : 'received');
    
    messageElement.innerHTML = `
        <div class="username">${data.username}</div>
        <div class="content">${data.message}</div>
        <div class="time">${data.time}</div>
    `;
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Handle user connection updates
socket.on('user-connected', (user) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = `${user} joined the chat`;
    messagesDiv.appendChild(messageElement);
});

socket.on('user-disconnected', (user) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = `${user} left the chat`;
    messagesDiv.appendChild(messageElement);
});

// Update users list
socket.on('user-list', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        usersList.appendChild(li);
    });
});