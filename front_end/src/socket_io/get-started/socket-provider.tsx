import React from "react";
import { UserData, GenericDataNorm } from "./types";

export const SocketContextWithData = React.createContext<{
  usersNormData: GenericDataNorm<UserData> | null;
  setUsersNormData: React.Dispatch<React.SetStateAction<GenericDataNorm<UserData> | null>>;

  currentUser: UserData | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}>(null!);

export const SocketIOClientWithDataProvider = ({
  children,
}: {
  children?: React.ReactNode;
}): JSX.Element => {
  const [usersNormData, setUsersNormData] = React.useState<GenericDataNorm<UserData> | null>(null);
  const [currentUser, setCurrentUser] = React.useState<UserData | null>(null);

  const passedValue = {
    usersNormData,
    setUsersNormData,
    currentUser,
    setCurrentUser,
  };

  return (
    <SocketContextWithData.Provider value={passedValue}>{children}</SocketContextWithData.Provider>
  );
};
