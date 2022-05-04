import axios from "axios";
import React from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { MESSAGES_ENDPOINT } from "../../root/endpoints";
import { TimeAgo } from "../../shared/time-ago";
import {
  transformArrayToNormStateObj,
  useChatWithReactQuerySubscription,
} from "./hooks/chat.hooks";
import { StyledChat, StyledMessageForm, Button } from "./shared-styled";
import { SocketContextWithData } from "./socket-provider";
import { MessageWithRelations, UserData } from "./types";

const UlWrapper = styled.div`
  width: 100%;
  overflow-y: scroll;
  max-height: 60vh;
`;

const StyledUl = styled.ul`
  padding: 2em;
  display: flex;
  flex-direction: column;
`;

const StyledLi = styled.li`
  display: flex;
  flex-direction: column;
`;

type GetAllMessagesType = {
  count: number;
  messagesArr: MessageWithRelations[];
};

const fetchMessages = async () => {
  const res = await axios.get<GetAllMessagesType>(`${MESSAGES_ENDPOINT}`);
  const arrData = res.data.messagesArr;
  const normData = transformArrayToNormStateObj(arrData);
  return normData;
};

export default function ChatForm() {
  const chatMethods = useChatWithReactQuerySubscription();
  const chatData = React.useContext(SocketContextWithData);

  const { data, isLoading, isError, isSuccess } = useQuery(["messages"], fetchMessages);

  const [inputVal, setInputVal] = React.useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let message = formData.get("user-message") as string;
    if (!message) return;
    chatMethods.sendMessage({ message, userData: chatData.currentUser! });

    setInputVal("");
  }

  let renderedMessages;

  if (isLoading) {
    renderedMessages = <div>loading...</div>;
  } else if (isError) {
    renderedMessages = <div>error</div>;
  }

  renderedMessages = data
    ? Object.values(data).map((msg, i) => (
        <StyledLi key={i}>
          <div className="d-flex gap-2">
            <div>{msg.userData.username}</div>
            <div>{msg.message}</div>
          </div>
          <TimeAgo timeStamp={msg.updatedAt} />
        </StyledLi>
      ))
    : null;

  const renderedActiveUsers = chatData.usersNormData
    ? Object.values(chatData.usersNormData).map((item, i) => (
        <UserItemWithData key={item.id} item={item} />
      ))
    : null;

  return (
    <div className="row">
      <div className="col-8">
        <StyledChat>
          <UlWrapper>
            <StyledUl>{renderedMessages}</StyledUl>
          </UlWrapper>
          <StyledMessageForm>
            <div>username: {chatData.currentUser?.username}</div>
            <form autoComplete="off" onSubmit={handleSubmit}>
              <input
                value={inputVal}
                onChange={(e) => setInputVal(e.currentTarget.value)}
                type="text"
                name="user-message"
              />
              <Button type="submit" disabled={!inputVal}>
                send{" "}
              </Button>
            </form>
          </StyledMessageForm>

          <Button
            onClick={() => {
              chatData.setCurrentUser(null);
              window.localStorage.removeItem("currentUser");
            }}
          >
            sign out
          </Button>
        </StyledChat>
      </div>
      <div className="col-sm-auto col-2">
        <h4>active users</h4>
        <ul>{renderedActiveUsers}</ul>
      </div>
    </div>
  );
}

export const UserItemWithData = ({ item }: { item: UserData }) => {
  return <StyledLi>{item.username}</StyledLi>;
};
