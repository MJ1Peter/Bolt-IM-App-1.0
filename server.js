const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Store connected users
const users = new Set();

io.on('connection', (socket) => {
  console.log('A user connected');

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

  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.username);
      io.emit('user-disconnected', socket.username);
      io.emit('user-list', Array.from(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});