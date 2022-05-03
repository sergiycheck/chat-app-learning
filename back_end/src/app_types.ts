import { Schema, model, Document, Types } from 'mongoose';

export enum EventsTypes {
  chat_update_user = 'chat_update_socket_id_for_user',
  //
  chat_message_send = 'chat:message:send',
  chat_message_get = 'chat:message:get',
  //
  user_enter_get_users = 'user:enter_room_get_users',
  user_enter_send_users = 'user:enter_room_send_users',
  //
  user_leave_room = 'user:leave_room',
  other_user_leave_room = 'other_user:leave_room',
  //
  connection = 'connection',
  disconnect = 'disconnect',
  disconnecting = 'disconnecting',
}

export type UserData = {
  id: string;
  username: string;
  socketId: string | null;
};

type MessageRootData = {
  id: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MessageEntity = MessageRootData & {
  userData: Types.ObjectId;
};

export type MessagesWithUserData = Omit<MessageRootData, 'createdAt' | 'updatedAt'> & {
  userData: UserData;
  createdAt: string;
  updatedAt: string;
};
