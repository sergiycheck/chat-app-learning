import { Socket, Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { MessagesWithUserData, EventsTypes, UserData } from '../app_types';
import { currentUsersInChat, messages, rooms, usersData } from '../run-time-db-entities';
import { mapUsersDataMapToArray } from './chat-shared-handlers';

type UpdateUserType = {
  userId: string;
  socketId: string;
};
type UpdateCallBackType = (arg: any) => void;

export const chatHandlers = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  //
  socket.on(EventsTypes.chat_update_user, (data: UpdateUserType, callback: UpdateCallBackType) => {
    const { userId, socketId } = data;
    const userData = usersData.get(userId);
    userData.socketId = socketId;
    callback({ userData });
  });
  //
  socket.on(EventsTypes.chat_message_send, ({ data }: { data: MessagesWithUserData }) => {
    const { message, userData } = data;
    console.log('message: ' + message, 'from user', userData);
    messages.push({ message, userData });
    io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { message, userData });
  });

  // socket.on(EventsTypes.user_sign_in, ({ username }: { username: string }, callback) => {
  //   const msg = `user ${username} sign in`;
  //   console.log(msg);
  //   const newUser = { id: randomUUID(), username };

  //   io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { message: msg, user: newUser });

  //   users.set(socket.id, newUser);

  //   sendUsersHandlerSocketEmit({ currentUser: false, io, socket })();

  //   callback(newUser);
  // });

  socket.on(EventsTypes.user_enter_get_users, ({ userId }: { userId: string }) => {
    const userData = usersData.get(userId);
    currentUsersInChat.set(userId, userData);

    const usersDataArr = mapUsersDataMapToArray(currentUsersInChat);

    console.log('sending current users in chat data', usersDataArr);
    io.to(rooms.chat_room).emit(EventsTypes.user_enter_send_users, {
      usersDataArr,
    });
    //
    const msg = `user ${userData.username} joins chat`;
    io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { message: msg, userData });
  });

  socket.on(
    EventsTypes.user_leave_room,
    ({ userId, roomName }: { userId: string; roomName: string }) => {
      socket.leave(roomName);
      let userData: UserData = usersData.get(userId);

      currentUsersInChat.delete(userData.id);

      const msg = `user ${userData.username} leaves room ${roomName}`;
      console.log('current users in chat', currentUsersInChat);
      console.log(msg);

      socket.to(roomName).emit(EventsTypes.other_user_leave_room, { userData, message: msg });
    },
  );
};
