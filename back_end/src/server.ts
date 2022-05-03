import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { EventsTypes } from './app_types';
import logger from 'morgan';
import api from './api';
import onConnection from './socket-handlres';

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger('dev'));

export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

io.on(EventsTypes.connection, (socket: Socket) => {
  onConnection(socket, io);
});

app.use('/api', api);
