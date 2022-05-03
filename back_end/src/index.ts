import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { EventsTypes } from './app_types';
import { roomJoinHandler } from './socket-handlres/room-join-handler';
import { disconnectionHandlers } from './socket-handlres/disconnection-handlers';
import { chatHandlers } from './socket-handlres/chat-handlers';
import { randomUUID } from 'crypto';
import { usersData } from './run-time-db-entities';
import { mapUsersDataMapToArray } from './socket-handlres/chat-shared-handlers';

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

const onConnection = (socket: Socket) => {
  roomJoinHandler(socket, io);
  disconnectionHandlers(socket);
  chatHandlers(socket, io);
};

io.on(EventsTypes.connection, (socket) => {
  onConnection(socket);
});

app.post('/sign-in', (req, res) => {
  const { username } = req.body as { username: string };
  const msg = `user ${username} sign in`;
  console.log(msg);
  const newUser = { id: randomUUID(), username, socketId: null };
  usersData.set(newUser.id, newUser);
  res.json({ userData: newUser });
});

app.get('/get-user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = usersData.get(userId);
  res.json({ userData: user });
});

app.get('/get-users', (req, res) => {
  const usersDataArr = mapUsersDataMapToArray(usersData);
  res.json({ usersDataArr });
});

server.listen(3020, () => {
  console.log('listening on *:3020');
});
