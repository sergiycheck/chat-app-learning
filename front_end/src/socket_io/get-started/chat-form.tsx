import React from "react";
import styled from "styled-components";
import { useChatWithReactQuerySubscription } from "./chat.hooks";

import { StyledChat, StyledMessageForm, Button } from "./shared-styled";
import { SocketContextWithData } from "./socket-provider";

const StyledUl = styled.ul`
  padding: 2em;
`;

const StyledLi = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 2rem;
`;

export default function ChatForm() {
  const chatMethods = useChatWithReactQuerySubscription();
  const chatData = React.useContext(SocketContextWithData);

  const [inputVal, setInputVal] = React.useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let message = formData.get("user-message") as string;
    if (!message) return;
    chatMethods.sendMessage(message);

    setInputVal("");
  }

  const renderedMessages = chatData.messages.map((msg, i) => (
    <StyledLi key={i}>
      <div>username: {msg.user.username}</div>
      <div>message: {msg.message}</div>
    </StyledLi>
  ));

  return (
    <StyledChat>
      <StyledUl>{renderedMessages}</StyledUl>
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
        }}
      >
        sign out
      </Button>
    </StyledChat>
  );
}
