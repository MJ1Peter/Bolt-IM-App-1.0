require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require("@deepgram/sdk");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

app.use(express.static('public'));

// Store connected users
const users = new Set();

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('new-user', (username) => {
    users.add(username);
    socket.username = username;
    io.emit('user-connected', username);
    io.emit('user-list', Array.from(users));
  });

  socket.on('chat-message', (message) => {
    io.emit('chat-message', {
      username: socket.username,
      message: message,
      time: new Date().toLocaleTimeString()
    });
  });

  console.log('DEEPGRAM_API_KEY:', process.env.DEEPGRAM_API_KEY);
  
  socket.on('audio', async (audioData) => {
    const live = deepgram.listen.live({ model: "nova" });

    live.addListener('open', () => {
      live.send(audioData);
    });

    live.addListener('transcriptReceived', (transcription) => {
      const transcript = JSON.parse(transcription).channel.alternatives[0].transcript;
      if (transcript) {
        socket.emit('transcript', transcript);
      }
    });

    live.addListener('close', () => {
      console.log('Deepgram connection closed');
    });

    live.addListener('error', (error) => {
      console.error('Deepgram error:', error);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (socket.username) {
      users.delete(socket.username);
      io.emit('user-disconnected', socket.username);
      io.emit('user-list', Array.from(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
