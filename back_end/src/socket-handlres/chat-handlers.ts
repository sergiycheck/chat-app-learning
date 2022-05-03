import { Socket, Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { MessagesWithUserData, EventsTypes, UserData } from '../app_types';
import { rooms } from '../run-time-db-entities';
import userModel, { currentUsersInChatModel } from '../models/user';
import messageModel from '../models/message';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

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
  socket.on(
    EventsTypes.chat_update_user,
    async (data: UpdateUserType, callback: UpdateCallBackType) => {
      const { userId, socketId } = data;

      const userData = await userModel.findOneAndUpdate(
        { _id: userId },
        { socketId: socketId },
        { new: true },
      );

      callback({ userData });
    },
  );
  //
  socket.on(
    EventsTypes.chat_message_send,
    async (data: { message: string; userData: UserData }) => {
      const { message, userData } = data;

      const id = new mongoose.Types.ObjectId();
      const messageNewObj = new messageModel({
        _id: id,
        id,
        message,
        userData: userData.id,
      });

      await messageNewObj.save();

      const messageObj = await messageModel.findOne({ _id: id }).populate({ path: 'userData' });

      io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { messageWithUser: messageObj });
    },
  );
  //
  socket.on(EventsTypes.user_enter_get_users, async ({ userId }: { userId: string }) => {
    const userData = await userModel.findById(userId);

    if (!userData) {
      io.to(rooms.chat_room).emit(EventsTypes.user_enter_send_users, {
        usersDataArr: [],
      });
      return;
    }

    const userObj = userData.toObject();

    const newCurrentUserToAdd = {
      ...userObj,
      _id: new mongoose.Types.ObjectId(),
    };
    const currentUserAdd = new currentUsersInChatModel({
      ...newCurrentUserToAdd,
    });

    await currentUserAdd.save();
    const allCurrentUsers = await currentUsersInChatModel.find();

    io.to(rooms.chat_room).emit(EventsTypes.user_enter_send_users, {
      usersDataArr: allCurrentUsers,
    });
    //
    const msg = `user ${userData.username} joins chat`;

    const messageObj: MessagesWithUserData = {
      id: randomUUID(),
      createdAt: `${Date.now()}`,
      updatedAt: `${Date.now()}`,
      message: msg,
      userData: {
        id: randomUUID(),
        username: 'system',
        socketId: socket.id,
      },
    };
    //
    io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { messageWithUser: messageObj });
  });
  //
  socket.on(
    EventsTypes.user_leave_room,
    async ({ userId, roomName }: { userId: string; roomName: string }) => {
      socket.leave(roomName);

      const userData = await userModel.findById(userId);

      const delRes = await currentUsersInChatModel.deleteOne({ id: userData.id });

      const msg = `user ${userData.username} leaves room ${roomName}`;
      console.log(msg);

      const messageObj: MessagesWithUserData = {
        id: randomUUID(),
        createdAt: `${Date.now()}`,
        updatedAt: `${Date.now()}`,
        message: msg,
        userData,
      };

      socket.to(roomName).emit(EventsTypes.other_user_leave_room, { messageWithUser: messageObj });
    },
  );
};
