export type UserData = {
  id: string;
  username: string;
  socketId: string | null;
};

export type MessagesWithUserData = {
  message: string;
  userData: UserData;
};

export type UserDataNorm = {
  [key: string]: UserData;
};
