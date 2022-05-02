import { Socket, Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { rooms } from '../run-time-db-entities';

export const roomJoinHandler = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  console.log('user connected', 'socket id', socket.id);

  socket.join(rooms.chat_room);

  console.log('clients in room count', io.sockets.adapter.rooms.get(rooms.chat_room).size);
  console.log('socket.rooms ', socket.rooms);

  io.of('/').adapter.on('create-room', (room) => {
    console.log(`room ${room} was created`);
  });

  io.of('/').adapter.on('join-room', (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
  });
};
