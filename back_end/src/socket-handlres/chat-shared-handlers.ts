import { Socket, Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { EventsTypes } from '../app_types';
import { rooms, users } from '../run-time-db-entities';

export function sendUsersHandlerSocketEmit({
  currentUser = true,
  io,
  socket,
}: {
  currentUser: boolean;
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  socket: Socket;
}) {
  return function () {
    const usersData = [];
    for (let item of users.entries()) {
      let [key, value] = item;
      usersData.push({ socketId: key, user: value });
    }
    console.log('sending users data', usersData);

    if (currentUser) {
      socket.emit(EventsTypes.user_enter_send_users, {
        usersData,
      });
    } else {
      io.to(rooms.chat_room).emit(EventsTypes.user_enter_send_users, {
        usersData,
      });
    }
  };
}

export function userLeaveRoomHandler({ room, socket }: { room: string; socket: Socket }) {
  let user = users.get(socket.id);
  const userData = { socketId: socket.id, user: user };
  users.delete(socket.id);

  console.log('room', room, 'user has left', 'socket.id', socket.id, 'user', user);
  let msg;
  if (!user) {
    msg = `user unknown leaves room`;
    userData.user = { username: 'unknown', id: socket.id };
  } else {
    msg = `user ${user.username} leaves room`;
  }

  socket.to(room).emit(EventsTypes.user_leave, { userData, message: msg });
}
