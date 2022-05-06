import axios from "axios";
import React from "react";
import { useQuery } from "react-query";
import { MESSAGES_ENDPOINT } from "../../root/endpoints";
import { TimeAgo } from "../../shared/time-ago";
import {
  transformArrayToNormStateObj,
  useChatWithReactQuerySubscription,
} from "./hooks/chat.hooks";
import {
  StyledChat,
  Button,
  UlWrapper,
  StyledUl,
  StyledLi,
  StyledMessageContainer,
  StyledDelMsgBtn,
} from "./shared-styled";
import { SocketContextWithData } from "./socket-provider";
import { MessageWithRelations, UserData } from "./types";

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

  const { data, isLoading, isError } = useQuery(["messages"], fetchMessages);

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
    ? Object.values(data).map((msg, i) => {
        const messageFromCurrentUser = Boolean(msg.userData.id === chatData.currentUser?.id);

        return (
          <StyledLi left={messageFromCurrentUser} key={i}>
            <StyledMessageContainer className="border rounded p-3 m-2">
              <div className="d-flex gap-2">
                <div>{msg.userData.username}</div>
                <div>{msg.message}</div>
              </div>
              <TimeAgo timeStamp={msg.updatedAt} />
              {msg.canDelete && msg.userData.id === chatData.currentUser?.id && (
                <StyledDelMsgBtn
                  onClick={() => {
                    chatMethods.deleteMessage({
                      messageId: msg.id,
                      userData: chatData.currentUser!,
                    });
                  }}
                >
                  x
                </StyledDelMsgBtn>
              )}
            </StyledMessageContainer>
          </StyledLi>
        );
      })
    : null;

  const renderedActiveUsers = chatData.usersNormData
    ? Object.values(chatData.usersNormData).map((item, i) => (
        <UserItemWithData key={item.id} item={item} />
      ))
    : null;

  const lastMessageRef = React.useRef<HTMLLIElement>(null);
  React.useEffect(() => {
    lastMessageRef?.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [data]);

  return (
    <div className="row m-0 p-0">
      <div className="row align-items-center my-4">
        <div className="col">
          <h4>username: {chatData?.currentUser?.username}</h4>
        </div>
        <div className="col-auto">
          <Button
            className="btn"
            onClick={() => {
              chatData.setCurrentUser(null);
              window.localStorage.removeItem("currentUser");
            }}
          >
            sign out
          </Button>
        </div>
      </div>

      <div className="row m-0 p-0">
        <div className="col-12 col-sm">
          <StyledChat className="row gap-4">
            <UlWrapper className="col-12 p-0">
              <StyledUl>
                {renderedMessages}
                <StyledLi ref={lastMessageRef}></StyledLi>
              </StyledUl>
            </UlWrapper>
            <div className="col-12 p-0">
              <form className="row align-items-center" autoComplete="off" onSubmit={handleSubmit}>
                <div className="col">
                  <input
                    className="form-control"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.currentTarget.value)}
                    name="user-message"
                  />
                </div>
                <div className="col-auto">
                  <div className="d-flex align-content-start flex-shrink-0">
                    <Button className="btn" type="submit" disabled={!inputVal}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-send"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </StyledChat>
        </div>

        <div className="col-12 col-sm-auto">
          <h4>active users</h4>
          <ul>{renderedActiveUsers}</ul>
        </div>
      </div>
    </div>
  );
}

export const UserItemWithData = ({ item }: { item: UserData }) => {
  return <StyledLi>{item.username}</StyledLi>;
};
