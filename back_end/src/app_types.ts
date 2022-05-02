export enum EventsTypes {
  user_sign_in = 'user:sign_in',
  chat_message_send = 'chat:message:send',
  chat_message_get = 'chat:message:get',
  //
  user_enter_get_users = 'user:enter_room_get_users',
  user_enter_send_users = 'user:enter_room_send_users',
  //
  user_leave = 'user:leave_room',
  user_sing_out = 'user:sing_out',
  //
  connection = 'connection',
  disconnect = 'disconnect',
  disconnecting = 'disconnecting',
}

export type User = {
  id: string;
  username: string;
};

export type MessagesWithUserType = {
  message: string;
  user: User;
};

export type SocketIdWithUser = {
  socketId: string;
  user: User;
};

export type UserLeaveRoomType = {
  message: string;
  userData: SocketIdWithUser;
};
