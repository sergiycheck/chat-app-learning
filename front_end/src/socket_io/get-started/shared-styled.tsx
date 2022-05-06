import styled from "styled-components";

export const StyledChat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  min-height: 70vh;
  justify-content: start;

  & ul {
    flex-grow: 1;
  }
`;

export const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

export const Button = styled.button`
  background: palevioletred;
  color: #f0f0f0;
  font-size: 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;

  &:disabled {
    background-color: #a27080;
  }
  &:hover {
    color: white;
  }
`;

export const UlWrapper = styled.div`
  width: 100%;
  overflow-y: scroll;
  max-height: 60vh;
`;

export const StyledUl = styled.ul`
  padding: 2em;
  display: flex;
  flex-direction: column;
  min-height: 60vh;
`;

export const StyledLi = styled.li<{ left?: boolean | undefined }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.left ? "flex-end" : "flex-start")};
`;

export const StyledMessageContainer = styled.div`
  position: relative;
`;

export const StyledDelMsgBtn = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background-color: transparent;
  color: inherit;
  border: none;
`;
