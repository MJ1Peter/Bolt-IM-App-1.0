const socket = io();
const messagesDiv = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const usernameModal = document.getElementById('username-modal');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const usersList = document.getElementById('users-list');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

let username;
let mediaRecorder;

// Audio recording controls
startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    stopButton.disabled = false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
            socket.emit('audio', event.data);
        }
    });
    mediaRecorder.start(1000); // Send audio data every second
});

stopButton.addEventListener('click', () => {
    startButton.disabled = false;
    stopButton.disabled = true;
    mediaRecorder.stop();
});

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

// Handle receiving transcripts
socket.on('transcript', (transcript) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add('transcript');
    
    messageElement.innerHTML = `
        <div class="username">${username}</div>
        <div class="content">${transcript}</div>
        <div class="time">${new Date().toLocaleTimeString()}</div>
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
