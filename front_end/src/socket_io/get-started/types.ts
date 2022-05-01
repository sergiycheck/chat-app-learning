export enum OperationsTypes {
  user_sign_in = "user:sign_in",
  chat_message_send = "chat:message:send",
  chat_message_get = "chat:message:get",
}

export type User = {
  id: string;
  username: string;
};

export type MessagesWithUserType = {
  message: string;
  user: User;
};
