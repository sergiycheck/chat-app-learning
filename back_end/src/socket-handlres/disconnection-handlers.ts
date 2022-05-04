import { Socket, Server } from 'socket.io';
import { EventsTypes } from '../app_types';
import { rooms } from '../run-time-db-entities';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export const disconnectionHandlers = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  //
  socket.on(EventsTypes.disconnect, () => {
    console.log('user disconnected');
    socket.leave(rooms.chat_room);
  });
  //
  socket.on(EventsTypes.disconnecting, async (reason) => {
    console.log('socket disconnecting');
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`socket.id ${socket.id} has left room ${room}`);
      }
    }
  });
  //
};
