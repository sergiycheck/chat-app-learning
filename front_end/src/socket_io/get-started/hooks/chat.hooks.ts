import { useQueryClient } from "react-query";
import { GenericDataNorm } from "./../types";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import React from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../../../root/endpoints";
import { SocketContextWithData } from "../socket-provider";
import { UserData, MessageWithRelations } from "../types";
import { rooms, SocketEventsTypes } from "./socket.data";
import { useBeforeUnload } from "./useBeforeUnload.hook";

export function transformArrayToNormStateObj<TData extends { id: string }>(itemsArr: Array<TData>) {
  const stateBuilder = (stateToBuild: GenericDataNorm<TData>) => {
    return (userData: TData) => {
      stateToBuild[userData.id] = userData;
    };
  };

  const stateToSet: GenericDataNorm<TData> = {};
  itemsArr.forEach(stateBuilder(stateToSet));
  return stateToSet;
}

// components that using the same hook does not share the same state!!!
export const useChatWithReactQuerySubscription = () => {
  const socketClientWithData = React.useContext(SocketContextWithData);

  const queryClient = useQueryClient();

  const socketRef = React.useRef<Socket<DefaultEventsMap, DefaultEventsMap>>();

  //TODO: useBefore unload is not hitting on the server?
  const beforeUnloadHandler = (val: any) => {
    console.log("before unload", `${socketRef.current?.connected}`);
    socketRef.current?.emit(SocketEventsTypes.user_leave_room, {
      userId: socketClientWithData.currentUser?.id,
      roomName: rooms.chat_room,
    });
  };

  useBeforeUnload(beforeUnloadHandler);

  const [socketMounted, setSocketMounted] = React.useState<Boolean>(false);
  const connectionSocketHandlers = () => {
    console.log("sending connection req");

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
      //
      socketRef.current?.disconnect();
      //
      socketRef.current?.off(SocketEventsTypes.connect);
      socketRef.current?.off(SocketEventsTypes.disconnect);
    };
  };
  React.useEffect(connectionSocketHandlers, []);

  const sendCallUpdateUser = React.useRef(false);
  const updateUserEffectHandler = () => {
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
      sendCallUpdateUser.current = true;
    }
  };
  React.useEffect(updateUserEffectHandler, [socketMounted, socketClientWithData]);

  const chatInteractionEffectHandler = () => {
    function updateMessages(msg: MessageWithRelations) {
      queryClient.setQueriesData(["messages"], (updaterOldData) => {
        const oldData = updaterOldData as unknown as GenericDataNorm<MessageWithRelations>;
        const result = { ...oldData, [msg.id]: msg };
        return result;
      });
    }

    function messageHandler({ messageWithUser }: { messageWithUser: MessageWithRelations }) {
      console.log("message get", messageWithUser);
      updateMessages(messageWithUser);
    }

    socketRef.current?.on(SocketEventsTypes.chat_message_get, messageHandler);

    function userEnterGetSentUsers({ usersDataArr }: { usersDataArr: Array<UserData> }) {
      console.log("got data on user enter", usersDataArr);

      const stateToSet = transformArrayToNormStateObj(usersDataArr);

      socketClientWithData.setUsersNormData((prevUsersData) => ({
        ...prevUsersData,
        ...stateToSet,
      }));
    }

    socketRef.current?.on(SocketEventsTypes.user_enter_send_users, userEnterGetSentUsers);

    function otherUserLeaveChatHandler({
      messageWithUser,
    }: {
      messageWithUser: MessageWithRelations;
    }) {
      const { userData, message } = messageWithUser;
      console.log(message);
      updateMessages(messageWithUser);
      //
      socketClientWithData.setUsersNormData((pUserData) => {
        if (pUserData) delete pUserData[userData.id];
        return { ...pUserData };
      });
    }

    socketRef.current?.on(SocketEventsTypes.other_user_leave_room, otherUserLeaveChatHandler);

    const messageDeleteResponseHandler = (data: { messageId: string }) => {
      const { messageId } = data;
      queryClient.setQueriesData(["messages"], (updaterOldData) => {
        const oldData = updaterOldData as unknown as GenericDataNorm<MessageWithRelations>;
        const newData = { ...oldData };
        delete newData[messageId];
        return newData;
      });
    };

    socketRef.current?.on(SocketEventsTypes.chat_msg_del_res, messageDeleteResponseHandler);

    return () => {
      //
      socketRef.current?.off(SocketEventsTypes.chat_message_get, messageHandler);
      //
      socketRef.current?.off(SocketEventsTypes.user_enter_send_users, userEnterGetSentUsers);
      //
      socketRef.current?.off(SocketEventsTypes.other_user_leave_room, otherUserLeaveChatHandler);
      //
      socketRef.current?.off(SocketEventsTypes.chat_msg_del_res, messageDeleteResponseHandler);
    };
  };

  React.useEffect(
    chatInteractionEffectHandler,
    //eslint-disable-next-line
    [socketClientWithData]
  );

  const sendMessage = (data: { message: string; userData: UserData }) => {
    socketRef.current?.emit(SocketEventsTypes.chat_message_send, data);
  };

  const deleteMessage = (data: { messageId: string; userData: UserData }) => {
    socketRef.current?.emit(SocketEventsTypes.chat_msg_del_req, data);
  };

  return {
    sendMessage,
    deleteMessage,
  };
};
