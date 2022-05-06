import { Socket, Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { MessagesWithUserData, EventsTypes, UserData } from '../app_types';
import { rooms } from '../run-time-db-entities';
import userModel, { currentUsersInChatModel } from '../models/user';
import messageModel from '../models/message';
import mongoose, { Query, Document } from 'mongoose';
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
  async function findAndUpdateUserSocketId(userId: string, socketId: string) {
    let userData: mongoose.Document<unknown, any, UserData> &
      UserData & {
        _id: mongoose.Types.ObjectId;
      };
    try {
      userData = await userModel.findOneAndUpdate(
        { _id: userId },
        { socketId: socketId },
        { new: true },
      );
    } catch (error) {
      throw error;
    }

    return userData;
  }

  async function updateOrAddUserToUsersChat({
    userData,
    userId,
  }: {
    userData: mongoose.Document<unknown, any, UserData> &
      UserData & {
        _id: mongoose.Types.ObjectId;
      };
    userId: string;
  }) {
    const userObj = userData.toObject();

    let updateOrAddUserRes: mongoose.Document<unknown, any, UserData> &
      UserData & {
        _id: mongoose.Types.ObjectId;
      };

    const userInChat = await currentUsersInChatModel.exists({ id: userId });
    if (userInChat) {
      const { _id, ...updateKeyVal } = userObj;
      updateOrAddUserRes = await currentUsersInChatModel.findByIdAndUpdate(
        userInChat._id,
        { ...updateKeyVal },
        { new: true },
      );
    } else {
      const newCurrentUserToAdd = {
        ...userObj,
        _id: new mongoose.Types.ObjectId(),
      };
      const currentUserAdd = new currentUsersInChatModel({
        ...newCurrentUserToAdd,
      });

      updateOrAddUserRes = await currentUserAdd.save();
    }

    return updateOrAddUserRes;
  }

  socket.on(
    EventsTypes.chat_update_user,
    async (data: UpdateUserType, callback: UpdateCallBackType) => {
      const { userId, socketId } = data;

      const userData = await findAndUpdateUserSocketId(userId, socketId);

      const updateOrAddUserRes = await updateOrAddUserToUsersChat({ userData, userId });

      const msg = `user ${userData.username} joins chat`;

      const messageObj: MessagesWithUserData = {
        canDelete: false,
        id: randomUUID(),
        createdAt: `${new Date().toISOString()}`,
        updatedAt: `${new Date().toISOString()}`,
        message: msg,
        userData: updateOrAddUserRes,
      };

      io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { messageWithUser: messageObj });

      const allCurrentUsers = await currentUsersInChatModel.find();

      io.to(rooms.chat_room).emit(EventsTypes.user_enter_send_users, {
        usersDataArr: allCurrentUsers,
      });

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
        canDelete: true,
      });

      await messageNewObj.save();

      const messageQuery = await messageModel.findOne({ _id: id }).populate({ path: 'userData' });

      const messageObj = messageQuery.toObject() as unknown as Omit<
        MessagesWithUserData,
        'canDelete'
      >;
      const messageWithUser: MessagesWithUserData = {
        ...messageObj,
        canDelete: true,
      };

      io.to(rooms.chat_room).emit(EventsTypes.chat_message_get, { messageWithUser });
    },
  );

  socket.on(
    EventsTypes.chat_msg_del_req,
    async (data: { messageId: string; userData: UserData }) => {
      const { messageId, userData } = data;

      const msgFromDb = await messageModel.findOne({ _id: messageId });

      if (msgFromDb) {
        const msgObj = msgFromDb.toObject();

        if (msgObj.userData.toString() === userData.id) {
          const deleteRes = await messageModel.deleteOne({ _id: messageId });
          if (!deleteRes.deletedCount) return;

          io.to(rooms.chat_room).emit(EventsTypes.chat_msg_del_res, { messageId });
        }
      }
    },
  );

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
        canDelete: false,
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
