export const rooms = {
  chat_room: "chat room",
};

export enum SocketEventsTypes {
  chat_update_user = "chat_update_socket_id_for_user",
  //
  chat_message_send = "chat:message:send",
  chat_message_get = "chat:message:get",
  //--
  chat_msg_del_req = "chat:message:delete:request",
  chat_msg_del_res = "chat:message:delete:response",
  //
  user_enter_send_users = "user:enter_room_send_users",
  //
  user_leave_room = "user:leave_room",
  other_user_leave_room = "other_user:leave_room",
  other_user_leave_room_update_active_users = "other_user:leave_room:update_active_users",
  //
  connect = "connect",
  disconnect = "disconnect",
}
