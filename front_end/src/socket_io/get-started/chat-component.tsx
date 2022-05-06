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
    <div className="container-md">
      <div className="row g-2 justify-content-center">
        <div className="col-12">
          <Title>chat page</Title>
          {renderedChatContent}
        </div>
      </div>
    </div>
  );
}
