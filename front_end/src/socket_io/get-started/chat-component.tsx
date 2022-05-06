import React from "react";

import ChatForm from "./chat-form";
import LoginChatForm from "./login-chat-from";
import { Button, Title } from "./shared-styled";
import { SocketContextWithData } from "./socket-provider";

export default function ChatComponent() {
  const { currentUser } = React.useContext(SocketContextWithData);

  let renderedChatContent;
  if (currentUser) {
    renderedChatContent = <ChatAppPart />;
  } else {
    renderedChatContent = <LoginChatForm />;
  }

  return (
    <React.Fragment>
      <div className="container-md">
        <div className="row">
          <div className="col">
            <Title>chat page</Title>
          </div>
        </div>
      </div>

      <div className="d-flex flex-grow-1">
        <div className="container-md d-flex flex-column justify-content-center">
          {renderedChatContent}
        </div>
      </div>
    </React.Fragment>
  );
}

export function ChatAppPart() {
  const { currentUser } = React.useContext(SocketContextWithData);

  const [someChat, setSomeChat] = React.useState<JSX.Element>();

  return (
    <React.Fragment>
      <div className="row g-2 ">
        {!someChat && (
          <React.Fragment>
            <div className="col-12 m-0">
              <h4>{currentUser?.username} chat part</h4>
            </div>

            <div className="col">
              <Button
                className="btn"
                onClick={() => {
                  setSomeChat(<ChatForm />);
                }}
              >
                click to open chat
              </Button>
            </div>
          </React.Fragment>
        )}
      </div>

      {someChat}
    </React.Fragment>
  );
}
