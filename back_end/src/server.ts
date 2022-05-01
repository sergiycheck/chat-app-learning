import { Server } from 'socket.io';

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

io.on('connection', (socket) => {
  socket.emit('basicEmit', 1, '2', Buffer.from([3]));
});

io.on('connection', (socket) => {
  socket.on('hello', () => {
    // ...
  });
});
