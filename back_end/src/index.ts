import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { MessagesWithUserType, EventsTypes } from './app_types';
import { roomJoinHandler } from './socket-handlres/room-join-handler';
import { disconnectionHandlers } from './socket-handlres/disconnection-handlers';
import { chatHandlers } from './socket-handlres/chat-handlers';

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

server.listen(3020, () => {
  console.log('listening on *:3020');
});
