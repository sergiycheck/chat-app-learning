import React from "react";
import { useQueryClient } from "react-query";
import { SocketContextWithData } from "./socket-provider";
import { MessagesWithUserType, OperationsTypes } from "./types";

// components that using the same hook does not share the same state!!!

export const useChatWithReactQuerySubscription = () => {
  const queryClient = useQueryClient();

  const socketClientWithData = React.useContext(SocketContextWithData);

  React.useEffect(() => {
    const { socket } = socketClientWithData.socketIoClient;

    function updateMessages(msg: MessagesWithUserType) {
      socketClientWithData.setMessages((prevMessages) => {
        return [...prevMessages, msg];
      });
    }

    function messageHandler(messageWithUser: MessagesWithUserType) {
      console.log("message get", messageWithUser);
      updateMessages(messageWithUser);
    }

    socket?.on(OperationsTypes.chat_message_get, messageHandler);

    return () => {
      socket?.off(OperationsTypes.chat_message_get, messageHandler);
    };
  }, [socketClientWithData]);

  const sendMessage = (message: string) => {
    console.log("sending message ", message);
    const { socket } = socketClientWithData.socketIoClient;

    socket?.emit(OperationsTypes.chat_message_send, {
      message,
      user: socketClientWithData.currentUser,
    });
  };

  return { sendMessage };
};
