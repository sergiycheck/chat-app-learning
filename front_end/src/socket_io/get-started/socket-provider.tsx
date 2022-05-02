import React from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { MessagesWithUserType, User, SocketIdWithUser, OperationsTypes } from "./types";

enum SocketStartEvents {
  connect = "connect",
  disconnect = "disconnect",
}
export class SocketIOClient {
  url: string;
  public socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
  public mounted: Boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  mount() {
    this.socket = io(this.url);

    this.socket?.on(SocketStartEvents.connect, () => {
      console.log("connected");
      console.log("socket.id", this.socket?.id);
      this.mounted = true;
    });

    this.socket?.on(SocketStartEvents.disconnect, () => {
      console.log("disconnected");
      console.log("socket id", this.socket?.id); // undefined
      this.mounted = false;
    });
  }

  unmount() {
    this.socket?.off(SocketStartEvents.connect);
    this.socket?.off(SocketStartEvents.disconnect);
    this.socket?.disconnect();
  }
}

export const SocketContextWithData = React.createContext<{
  socketIoClient: SocketIOClient;

  messages: MessagesWithUserType[];
  setMessages: React.Dispatch<React.SetStateAction<MessagesWithUserType[]>>;

  usersWithSocketsIds: SocketIdWithUser[];
  setUsersWithSocketsIds: React.Dispatch<React.SetStateAction<SocketIdWithUser[]>>;

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
  const [messages, setMessages] = React.useState<MessagesWithUserType[]>([]);
  const [usersWithSocketsIds, setUsersWithSocketsIds] = React.useState<SocketIdWithUser[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [registeredHandlers, setRegisteredHandlers] = React.useState<string[]>([]);

  React.useEffect(() => {
    client.mount();

    return () => {
      client.unmount();
    };
  }, [client]);

  const passedValue = {
    socketIoClient: client,
    messages,
    setMessages,
    usersWithSocketsIds,
    setUsersWithSocketsIds,
    currentUser,
    setCurrentUser,
    registeredHandlers,
    setRegisteredHandlers,
  };

  return (
    <SocketContextWithData.Provider value={passedValue}>{children}</SocketContextWithData.Provider>
  );
};
