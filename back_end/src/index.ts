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
  //
  user_enter_get_users = 'user:enter_room_get_users',
  user_enter_send_users = 'user:enter_room_send_users',
  //
  user_leave = 'user:leave_room',
}

export type User = {
  id: string;
  username: string;
};

const users = new Map<string, User>();

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
        let user = users.get(socket.id);
        const userData = { socketId: socket.id, user };
        users.delete(socket.id);

        console.log('room', room, 'user has left', 'socket.id', socket.id, 'user', user);
        let msg;
        if (!user) {
          msg = `user unknown leaves room`;
          user = { username: 'unknown', id: socket.id };
        } else {
          msg = `user ${user.username} leaves room`;
        }

        socket.to(room).emit(OperationsTypes.user_leave, { userData, message: msg });
      }
    }
  });

  socket.on(
    OperationsTypes.chat_message_send,
    ({ message, user }: { message: string; user: User }) => {
      console.log('message: ' + message, 'from user', user);
      messages.push({ message, user });
      io.to(rooms.chat_room).emit(OperationsTypes.chat_message_get, { message, user });
    },
  );

  socket.on(OperationsTypes.user_sign_in, ({ username }: { username: string }, callback) => {
    const msg = `user ${username} sign in`;
    console.log(msg);
    const newUser = { id: randomUUID(), username };

    io.to(rooms.chat_room).emit(OperationsTypes.chat_message_get, { message: msg, user: newUser });

    users.set(socket.id, newUser);

    sendUsersHandlerSocketEmit(false);

    callback(newUser);
  });

  function sendUsersHandlerSocketEmit(currentUser = true) {
    const usersData = [];
    for (let item of users.entries()) {
      let [key, value] = item;
      usersData.push({ socketId: key, user: value });
    }
    console.log('sending users data', usersData);

    if (currentUser) {
      socket.emit(OperationsTypes.user_enter_send_users, {
        usersData,
      });
    } else {
      io.to(rooms.chat_room).emit(OperationsTypes.user_enter_send_users, {
        usersData,
      });
    }
  }

  socket.on(OperationsTypes.user_enter_get_users, sendUsersHandlerSocketEmit);
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
