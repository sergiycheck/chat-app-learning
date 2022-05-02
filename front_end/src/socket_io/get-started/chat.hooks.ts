import React from "react";
import { useQueryClient } from "react-query";
import { SocketContextWithData } from "./socket-provider";
import { MessagesWithUserType, OperationsTypes, SocketIdWithUser, User } from "./types";

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

    function userEnterGetSentUsers({ users }: { users: Array<SocketIdWithUser> }) {
      console.log("got data on user enter", users);
      socketClientWithData.setUsersWithSocketsIds((prevUsers) => {
        if (!prevUsers.length) {
          return [...users];
        } else if (users.length) {
          type StateType = {
            [key: string]: User;
          };
          const stateBuilder = (stateToBuild: StateType) => {
            return (u: SocketIdWithUser) => {
              stateToBuild[u.socketId] = u.user;
            };
          };

          const prevState: StateType = {};
          const currentUpdate: StateType = {};

          prevUsers.forEach(stateBuilder(prevState));
          users.forEach(stateBuilder(currentUpdate));

          const nextState = {
            ...prevState,
            ...currentUpdate,
          };

          const nextUserData = Object.entries(nextState).map(([key, val]) => ({
            socketId: key,
            user: val,
          })) as SocketIdWithUser[];

          return nextUserData;
        }

        return [...prevUsers];
      });
    }

    socket?.on(OperationsTypes.user_enter_send_users, userEnterGetSentUsers);

    function userLeaveHandler(messageWithUser: MessagesWithUserType) {
      const { user } = messageWithUser;
      console.log("user", user.username, "leaves room");
      updateMessages(messageWithUser);

      socketClientWithData.setUsersWithSocketsIds((pUserData) =>
        pUserData.filter((u) => u.user.id !== user.id)
      );
    }

    socket?.on(OperationsTypes.user_leave, userLeaveHandler);

    return () => {
      //
      socket?.off(OperationsTypes.chat_message_get, messageHandler);
      //
      socket?.off(OperationsTypes.user_enter_send_users, userEnterGetSentUsers);
      //
      socket?.off(OperationsTypes.user_leave, userLeaveHandler);
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

  const sendToGetUsersCallBack = React.useCallback(() => {
    const { socket } = socketClientWithData.socketIoClient;

    socket?.emit(OperationsTypes.user_enter_get_users);
  }, [socketClientWithData.socketIoClient]);

  return { sendMessage, sendToGetUsersCallBack };
};
