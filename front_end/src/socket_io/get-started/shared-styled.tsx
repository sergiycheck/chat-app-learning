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
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;

  &:disabled {
    background-color: #a27080;
  }
  &:hover {
    color: white;
  }
`;
