import React from "react";

import ChatForm from "./chat-form";
import LoginChatForm from "./login-chat-from";
import { Title } from "./shared-styled";
import { SocketContextWithData } from "./socket-provider";

export default function ChatComponent() {
  const { currentUser } = React.useContext(SocketContextWithData);

  let renderedChatContent;
  if (currentUser) {
    renderedChatContent = <ChatForm />;
  } else {
    renderedChatContent = <LoginChatForm />;
  }

  return (
    <React.Fragment>
      <Title>chat page</Title>
      <h4>username: {currentUser?.username}</h4>

      {renderedChatContent}
    </React.Fragment>
  );
}
