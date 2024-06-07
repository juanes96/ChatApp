import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

let users = [];

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('set nickname', (nickname) => {
    if (nickname.trim() && !users.find(user => user.nickname === nickname)) {
      socket.nickname = nickname;
      users.push({ id: socket.id, nickname });
      io.emit('user connected', users);
    }
  });

  socket.on('message', (data) => {
    if (data.message.trim()) {
      io.emit('message', data);
    }
  });

  socket.on('disconnect', () => {
    users = users.filter(user => user.id !== socket.id);
    io.emit('user disconnected', users);
  });
});

server.listen(4000, () => {
  console.log('server on port', 4000);
});



