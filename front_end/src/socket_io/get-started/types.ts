export type UserData = {
  id: string;
  username: string;
  socketId: string | null;
};

type MessageRootData = {
  id: string;
  message: string;
};

export type MessageWithRelations = MessageRootData & {
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  userData: UserData;
};

export type GenericDataNorm<TData> = {
  [key: string]: TData;
};
