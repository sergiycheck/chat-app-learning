import React from "react";
import { useQueryClient } from "react-query";
import { SocketContextWithData } from "./socket-provider";
import {
  MessagesWithUserType,
  OperationsTypes,
  SocketIdWithUser,
  UserDataNorm,
  UserLeaveRoomType,
} from "./types";

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

    function userEnterGetSentUsers({ usersData }: { usersData: Array<SocketIdWithUser> }) {
      console.log("got data on user enter", usersData);

      const stateBuilder = (stateToBuild: UserDataNorm) => {
        return (userData: SocketIdWithUser) => {
          stateToBuild[userData.socketId] = userData;
        };
      };
      const stateToSet: UserDataNorm = {};
      usersData.forEach(stateBuilder(stateToSet));
      socketClientWithData.setUsersNormData((prevUsersData) => ({
        ...prevUsersData,
        ...stateToSet,
      }));
    }

    socket?.on(OperationsTypes.user_enter_send_users, userEnterGetSentUsers);

    function userLeaveHandler(userLeaveRoomData: UserLeaveRoomType) {
      const { userData, message } = userLeaveRoomData;

      console.log("user", userData.user.username, "leaves room");

      updateMessages({ user: userData.user, message });

      socketClientWithData.setUsersNormData((pUserData) => {
        delete pUserData[userData.socketId];
        return { ...pUserData };
      });
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

  const singOutCallBack = React.useCallback(() => {
    const { socket } = socketClientWithData.socketIoClient;

    socket?.emit(OperationsTypes.user_enter_get_users);
  }, [socketClientWithData.socketIoClient]);

  return { sendMessage, sendToGetUsersCallBack };
};
