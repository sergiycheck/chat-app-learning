import { DefaultEventsMap } from "@socket.io/component-emitter";
import React from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../../../root/endpoints";
import { SocketContextWithData } from "../socket-provider";
import { UserData, MessagesWithUserData, UserDataNorm } from "../types";
import { rooms, SocketEventsTypes } from "./socket.data";

// components that using the same hook does not share the same state!!!

export const useChatWithReactQuerySubscription = () => {
  const socketClientWithData = React.useContext(SocketContextWithData);

  //
  const socketRef = React.useRef<Socket<DefaultEventsMap, DefaultEventsMap>>();
  const [socketMounted, setSocketMounted] = React.useState<Boolean>(false);

  React.useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current?.on(SocketEventsTypes.connect, () => {
      console.log("connected");
      console.log("socket.id", socketRef.current?.id);
      setSocketMounted(true);
    });

    socketRef.current?.on(SocketEventsTypes.disconnect, () => {
      console.log("disconnected");
      console.log("socket id", socketRef.current?.id); // undefined
      setSocketMounted(false);
    });

    return () => {
      socketRef.current?.emit(SocketEventsTypes.user_leave_room, {
        userId: socketClientWithData.currentUser?.id,
        roomName: rooms.chat_room,
      });

      socketRef.current?.disconnect();
      //
      socketRef.current?.off(SocketEventsTypes.connect);
      socketRef.current?.off(SocketEventsTypes.disconnect);
      //
    };
    //eslint-disable-next-line
  }, []);

  const sendCallUpdateUser = React.useRef(false);
  React.useEffect(() => {
    if (!sendCallUpdateUser.current && socketMounted) {
      //
      const userId = socketClientWithData.currentUser?.id;
      const socketId = socketRef.current?.id;
      const data = { userId, socketId };
      //
      socketRef.current?.emit(SocketEventsTypes.chat_update_user, data, (response: any) => {
        const { userData } = response as { userData: UserData };
        socketClientWithData.setCurrentUser(userData);
      });
      //
      socketRef.current?.emit(SocketEventsTypes.user_enter_get_users, {
        userId: socketClientWithData.currentUser!.id,
      });
      //
      sendCallUpdateUser.current = true;
    }
  }, [socketMounted, socketClientWithData]);

  React.useEffect(() => {
    function updateMessages(msg: MessagesWithUserData) {
      socketClientWithData.setMessages((prevMessages) => {
        return [...prevMessages, msg];
      });
    }

    function messageHandler(messageWithUser: MessagesWithUserData) {
      console.log("message get", messageWithUser);
      updateMessages(messageWithUser);
    }

    socketRef.current?.on(SocketEventsTypes.chat_message_get, messageHandler);

    function userEnterGetSentUsers({ usersDataArr }: { usersDataArr: Array<UserData> }) {
      console.log("got data on user enter", usersDataArr);

      const stateBuilder = (stateToBuild: UserDataNorm) => {
        return (userData: UserData) => {
          stateToBuild[userData.id] = userData;
        };
      };
      const stateToSet: UserDataNorm = {};
      usersDataArr.forEach(stateBuilder(stateToSet));
      socketClientWithData.setUsersNormData((prevUsersData) => ({
        ...prevUsersData,
        ...stateToSet,
      }));
    }

    socketRef.current?.on(SocketEventsTypes.user_enter_send_users, userEnterGetSentUsers);

    function otherUserLeaveChatHandler(userLeaveRoomData: { userData: UserData; message: string }) {
      const { userData, message } = userLeaveRoomData;
      console.log(message);
      updateMessages({ userData: userData, message });
      //
      socketClientWithData.setUsersNormData((pUserData) => {
        delete pUserData[userData.id];
        return { ...pUserData };
      });
    }

    socketRef.current?.on(SocketEventsTypes.other_user_leave_room, otherUserLeaveChatHandler);

    return () => {
      //
      socketRef.current?.off(SocketEventsTypes.chat_message_get, messageHandler);
      //
      socketRef.current?.off(SocketEventsTypes.user_enter_send_users, userEnterGetSentUsers);
      //
      socketRef.current?.off(SocketEventsTypes.other_user_leave_room, otherUserLeaveChatHandler);
    };
  }, [socketClientWithData]);

  const sendMessage = (data: MessagesWithUserData) => {
    console.log("sending message ", data);

    socketRef.current?.emit(SocketEventsTypes.chat_message_send, {
      data,
    });
  };

  // const sendToGetUsersCallBack = React.useCallback(() => {
  //   const { socket } = socketClientWithData.socketIoClient;

  //   socket?.emit(OperationsTypes.user_enter_get_users);
  // }, [socketClientWithData.socketIoClient]);

  // const singOutCallBack = React.useCallback(() => {
  //   const { socket } = socketClientWithData.socketIoClient;

  //   socket?.emit(OperationsTypes.user_enter_get_users);
  // }, [socketClientWithData.socketIoClient]);

  return {
    sendMessage,
  };
};
