import axios from "axios";
import { useQuery } from "react-query";
import styled from "styled-components";

const StyledExample = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function Example() {
  const { isLoading, error, data, isFetching } = useQuery<
    void,
    Error,
    {
      name: string;
      description: string;
      subscribers_count: string;
      stargazers_count: string;
      forks_count: string;
    },
    "repoData"
  >("repoData", async () => {
    const res = await axios.get("https://api.github.com/repos/tannerlinsley/react-query");
    return res.data;
  });

  if (isLoading) return <div>"Loading ..."</div>;
  if (error) return <div>"an Error has occurred: " + error.message</div>;

  return data ? (
    <StyledExample>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong> <strong>✨ {data.stargazers_count}</strong>{" "}
      <strong>🍴 {data.forks_count}</strong>
      <div>{isFetching ? "Updating..." : ""}</div>
    </StyledExample>
  ) : (
    <div>empty</div>
  );
}
