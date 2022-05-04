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

    const msg = `user ${userData.username} joins chat`;

    const messageObj: MessagesWithUserData = {
      id: randomUUID(),
      createdAt: `${new Date().toISOString()}`,
      updatedAt: `${new Date().toISOString()}`,
      message: msg,
      userData: {
        id: randomUUID(),
        username: 'system',
        socketId: socket.id,
      },
    };

    io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { messageWithUser: messageObj });

    const allCurrentUsers = await currentUsersInChatModel.find();

    io.to(rooms.chat_room).emit(EventsTypes.user_enter_send_users, {
      usersDataArr: allCurrentUsers,
    });
  });

  //TODO: useBefore unload is not hitting on the server
  // only hitting when switching between components
  // but not on page reload
  socket.on(
    EventsTypes.user_leave_room,
    async ({ userId, roomName }: { userId: string; roomName: string }) => {
      const userData = await userModel.findById(userId);
      let msg;

      if (userData) {
        const delRes = await currentUsersInChatModel.deleteOne({ id: userData.id });
        if (delRes.deletedCount) {
          msg = `user ${userData.username} leaves room ${roomName}`;
        } else {
          msg = `can not remove user ${userData.username} from room ${roomName}`;
        }
      } else {
        msg = `user does not exist`;
      }

      const messageObj: MessagesWithUserData = {
        id: randomUUID(),
        createdAt: `${new Date().toISOString()}`,
        updatedAt: `${new Date().toISOString()}`,
        message: msg,
        userData,
      };

      socket.to(roomName).emit(EventsTypes.other_user_leave_room, { messageWithUser: messageObj });
      const targetRoom = io.sockets.adapter.rooms.get(rooms.chat_room);
      if (targetRoom) {
        console.log('clients in room count', targetRoom.size);
      }
      socket.leave(roomName);
    },
  );
};
