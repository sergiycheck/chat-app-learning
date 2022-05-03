import { Socket } from 'socket.io';
import { EventsTypes } from '../app_types';
import { rooms, usersData } from '../run-time-db-entities';

export const disconnectionHandlers = (socket: Socket) => {
  //
  socket.on(EventsTypes.disconnect, () => {
    console.log('user disconnected');
    socket.leave(rooms.chat_room);
  });
  //
  socket.on(EventsTypes.disconnecting, (reason) => {
    console.log('socket disconnecting');
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`socket.id ${socket.id} has left room ${room}`);
        console.log('users left', usersData);
      }
    }
  });
  //
};
