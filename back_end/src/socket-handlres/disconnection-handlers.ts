import { Socket } from 'socket.io';
import { EventsTypes } from '../app_types';
import { rooms, users } from '../run-time-db-entities';
import { userLeaveRoomHandler } from './chat-shared-handlers';

export const disconnectionHandlers = (socket: Socket) => {
  //
  socket.on(EventsTypes.disconnect, () => {
    console.log('user disconnected');
    socket.leave(rooms.chat_room);
  });
  //
  socket.on(EventsTypes.disconnecting, (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        userLeaveRoomHandler({ room, socket });
      }
    }
  });
  //
};
