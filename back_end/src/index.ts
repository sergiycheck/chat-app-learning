import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app: express.Application = express();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

export enum OperationsTypes {
  user_sign_in = 'user:sign_in',
  chat_message_send = 'chat:message:send',
  chat_message_get = 'chat:message:get',
}

export type User = {
  id: string;
  username: string;
};

const users = new Map();

const messages = [];

const rooms = {
  chat_room: 'chat room',
};

io.on('connection', (socket) => {
  console.log('user connected', 'socket id', socket.id);

  socket.join(rooms.chat_room);
  console.log('clients in room count', io.sockets.adapter.rooms.get(rooms.chat_room).size);
  console.log('socket.rooms ', socket.rooms);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.leave(rooms.chat_room);
    // socket.leave(socket.id);
  });

  socket.on('disconnecting', (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit('user has left', socket.id);
      }
    }
  });

  socket.on(
    OperationsTypes.chat_message_send,
    ({ message, user }: { message: string; user: User }) => {
      console.log('message: ' + message, 'from user', user);
      messages.push({ message, user });
      io.to(rooms.chat_room).emit(OperationsTypes.chat_message_get, { message, user });
      // socket.emit(OperationsTypes.chat_message_get, { message, user });
    },
  );

  socket.on(OperationsTypes.user_sign_in, ({ username }: { username: string }, callback) => {
    const msg = `user ${username} sign in`;
    console.log(msg);
    const newUser = { id: randomUUID(), username };

    io.to(rooms.chat_room).emit(OperationsTypes.chat_message_get, { message: msg, user: newUser });
    // socket.emit(OperationsTypes.chat_message_get, { message: msg, user: newUser });

    users.set(newUser.id, newUser);
    callback(newUser);
  });
});

io.of('/').adapter.on('create-room', (room) => {
  console.log(`room ${room} was created`);
});

io.of('/').adapter.on('join-room', (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});

server.listen(3020, () => {
  console.log('listening on *:3020');
});
