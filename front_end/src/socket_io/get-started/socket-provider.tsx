import React from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { MessagesWithUserType, User } from "./types";

export class SocketIOClient {
  url: string;
  public socket?: Socket<DefaultEventsMap, DefaultEventsMap>;

  constructor(url: string) {
    this.url = url;
  }

  mount() {
    this.socket = io(this.url);

    this.socket?.on("connect", () => {
      console.log("connected");
      console.log("socket.id", this.socket?.id);
    });

    this.socket?.on("disconnect", () => {
      console.log("disconnected");

      console.log("socket id", this.socket?.id); // undefined
    });
  }

  unmount() {
    this.socket?.disconnect();
  }
}

export const SocketContextWithData = React.createContext<{
  socketIoClient: SocketIOClient;

  messages: MessagesWithUserType[];
  setMessages: React.Dispatch<React.SetStateAction<MessagesWithUserType[]>>;

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;

  registeredHandlers: string[];
  setRegisteredHandlers: React.Dispatch<React.SetStateAction<string[]>>;
}>(null!);

export const SocketIOClientWithDataProvider = ({
  client,
  children,
}: {
  client: SocketIOClient;
  children?: React.ReactNode;
}): JSX.Element => {
  React.useEffect(() => {
    client.mount();

    return () => {
      client.unmount();
    };
  }, [client]);

  const [messages, setMessages] = React.useState<MessagesWithUserType[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [registeredHandlers, setRegisteredHandlers] = React.useState<string[]>([]);

  const passedValue = {
    socketIoClient: client,
    messages,
    setMessages,
    users,
    setUsers,
    currentUser,
    setCurrentUser,
    registeredHandlers,
    setRegisteredHandlers,
  };

  return (
    <SocketContextWithData.Provider value={passedValue}>{children}</SocketContextWithData.Provider>
  );
};
