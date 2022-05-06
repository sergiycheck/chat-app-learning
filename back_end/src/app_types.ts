import mongoose, { Schema, model, Document, Types } from 'mongoose';

export enum EventsTypes {
  chat_update_user = 'chat_update_socket_id_for_user',
  //
  chat_message_send = 'chat:message:send',
  chat_message_get = 'chat:message:get',
  //--
  chat_msg_del_req = 'chat:message:delete:request',
  chat_msg_del_res = 'chat:message:delete:response',
  //
  user_enter_send_users = 'user:enter_room_send_users',
  //
  user_leave_room = 'user:leave_room',
  other_user_leave_room = 'other_user:leave_room',
  other_user_leave_room_update_active_users = 'other_user:leave_room:update_active_users',
  //
  connection = 'connection',
  disconnect = 'disconnect',
  disconnecting = 'disconnecting',
}

export type UserData = {
  _id: mongoose.Types.ObjectId;
  id: string;
  username: string;
  socketId: string | null;
};

type MessageRootData = {
  id: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  canDelete: boolean;
};

export type MessageEntity = MessageRootData & {
  userData: Types.ObjectId;
};

export type MessagesWithUserData = Omit<MessageRootData, 'createdAt' | 'updatedAt'> & {
  userData: UserData;
  createdAt: string;
  updatedAt: string;
};
