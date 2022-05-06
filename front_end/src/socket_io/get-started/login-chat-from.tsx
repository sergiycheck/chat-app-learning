import axios, { AxiosError, AxiosResponse } from "axios";
import React from "react";
import { useMutation, UseMutationOptions } from "react-query";
import { USERS_ENDPOINT } from "../../root/endpoints";
import { useLocalStorage } from "./hooks/userLocalStorage.hook";
import { StyledChat, Button } from "./shared-styled";
import { SocketContextWithData } from "./socket-provider";
import { UserData } from "./types";

function useSingInUserMutation(
  options?: UseMutationOptions<AxiosResponse<{ userData: UserData }>, AxiosError, string>
) {
  return useMutation(
    ["current-user"],
    (username: string) => {
      return axios.post<{ userData: UserData }>(`${USERS_ENDPOINT}/sign-in`, { username });
    },
    options
  );
}

export default function LoginChatForm() {
  const [inputVal, setInputVal] = React.useState<string>("");
  const socketClientWithData = React.useContext(SocketContextWithData);

  const { mutate, isError, isLoading, isSuccess, data: resp, error } = useSingInUserMutation();

  const userSignIn = (username: string) => {
    mutate(username);
  };

  const [currentUser, setCurrentUser] = useLocalStorage(
    "currentUser",
    socketClientWithData.currentUser
  );

  React.useEffect(() => {
    if (currentUser) {
      socketClientWithData.setCurrentUser(currentUser);
    }
  }, [currentUser, socketClientWithData]);

  React.useEffect(() => {
    if (isSuccess) {
      const { userData } = resp.data;
      window.localStorage.setItem("currentUser", JSON.stringify(userData));
      socketClientWithData.setCurrentUser(userData);
    }
  }, [isSuccess, resp, socketClientWithData, setCurrentUser]);

  return (
    <StyledChat className="row">
      <form
        className="col-12 row"
        autoComplete="off"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (!inputVal) return;
          userSignIn(inputVal);
          setInputVal("");
        }}
      >
        <div className="col">
          <input
            className="form-control"
            value={inputVal}
            onChange={(e) => setInputVal(e.currentTarget.value)}
            type="text"
            name="username"
          />
        </div>
        <div className="col-auto">
          <Button className="btn" type="submit" disabled={!inputVal}>
            sign in{" "}
          </Button>
        </div>
      </form>
      {isLoading && <div>singing in...</div>}
      {isError && <div>An error occurred: {error.message}</div>}
      {isSuccess && <div>user signed in!</div>}
    </StyledChat>
  );
}
