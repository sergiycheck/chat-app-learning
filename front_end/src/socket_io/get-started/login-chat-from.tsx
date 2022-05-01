import React from "react";
import { StyledChat, Button } from "./shared-styled";
import { SocketContextWithData } from "./socket-provider";
import { OperationsTypes, User } from "./types";

export default function LoginChatForm() {
  const [inputVal, setInputVal] = React.useState<string>("");
  const socketClientWithData = React.useContext(SocketContextWithData);

  const userSignIn = (username: string) => {
    const { socket } = socketClientWithData.socketIoClient;

    socket?.emit(OperationsTypes.user_sign_in, { username }, (user: User) => {
      console.log("user got", user);
      socketClientWithData.setCurrentUser(user);
      socketClientWithData.setUsers((prevUsers) => [...prevUsers, user]);
    });
  };

  return (
    <StyledChat>
      <form
        autoComplete="off"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (!inputVal) return;
          userSignIn(inputVal);
          setInputVal("");
        }}
      >
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.currentTarget.value)}
          type="text"
          name="username"
        />
        <Button type="submit" disabled={!inputVal}>
          sign in{" "}
        </Button>
      </form>
    </StyledChat>
  );
}
