import { Socket, Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { MessagesWithUserType, EventsTypes } from '../app_types';
import { messages, rooms, users } from '../run-time-db-entities';
import { randomUUID } from 'crypto';
import { sendUsersHandlerSocketEmit, userLeaveRoomHandler } from './chat-shared-handlers';

export const chatHandlers = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  socket.on(EventsTypes.chat_message_send, (data: MessagesWithUserType) => {
    const { message, user } = data;
    console.log('message: ' + message, 'from user', user);
    messages.push({ message, user });
    io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { message, user });
  });

  socket.on(EventsTypes.user_sign_in, ({ username }: { username: string }, callback) => {
    const msg = `user ${username} sign in`;
    console.log(msg);
    const newUser = { id: randomUUID(), username };

    io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { message: msg, user: newUser });

    users.set(socket.id, newUser);

    sendUsersHandlerSocketEmit({ currentUser: false, io, socket })();

    callback(newUser);
  });

  socket.on(
    EventsTypes.user_enter_get_users,
    sendUsersHandlerSocketEmit({ currentUser: true, io, socket }),
  );

  socket.on(EventsTypes.user_sing_out, ({ roomName }: { roomName: string }) => {
    socket.leave(roomName);
    userLeaveRoomHandler({ room: roomName, socket });
  });
};
