import React from "react";
import { UserData, MessagesWithUserData, UserDataNorm } from "./types";

export const SocketContextWithData = React.createContext<{
  messages: MessagesWithUserData[];
  setMessages: React.Dispatch<React.SetStateAction<MessagesWithUserData[]>>;

  usersNormData: UserDataNorm;
  setUsersNormData: React.Dispatch<React.SetStateAction<UserDataNorm>>;

  currentUser: UserData | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserData | null>>;

  registeredHandlers: string[];
  setRegisteredHandlers: React.Dispatch<React.SetStateAction<string[]>>;
}>(null!);

export const SocketIOClientWithDataProvider = ({
  children,
}: {
  children?: React.ReactNode;
}): JSX.Element => {
  const [messages, setMessages] = React.useState<MessagesWithUserData[]>([]);
  const [usersNormData, setUsersNormData] = React.useState<UserDataNorm>({});
  const [currentUser, setCurrentUser] = React.useState<UserData | null>(null);
  const [registeredHandlers, setRegisteredHandlers] = React.useState<string[]>([]);

  const passedValue = {
    messages,
    setMessages,
    usersNormData,
    setUsersNormData,
    currentUser,
    setCurrentUser,
    registeredHandlers,
    setRegisteredHandlers,
  };

  return (
    <SocketContextWithData.Provider value={passedValue}>{children}</SocketContextWithData.Provider>
  );
};
