import React from "react";
import styled from "styled-components";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import Example from "../react_query/example_simple/Example";
import ChatComponent from "../socket_io/get-started/chat-component";
import { SocketIOClientWithDataProvider } from "../socket_io/get-started/socket-provider";

function AppRouting({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<React.Fragment>{children}</React.Fragment>}>
          <Route
            index
            element={
              <React.Fragment>
                <Example />
                <ReactQueryDevtools initialIsOpen />
              </React.Fragment>
            }
          />
          <Route path="web_sockets" element={<ChatComponent />} />
        </Route>
        <Route path="*" element={<div>unknown path</div>} />
      </Routes>
    </BrowserRouter>
  );
}

const App = styled.div`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: start;
  font-size: calc(10px + 1vmin);
  color: white;
`;

const StyledNav = styled.nav`
  display: flex;
  justify-content: space-around;
  & li {
    list-style: none;

    & a {
      color: inherit;
    }
  }
`;

const queryClient = new QueryClient();

export default function AppComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketIOClientWithDataProvider>
        <App>
          <AppRouting>
            <StyledNav>
              <li>
                <Link to="/">example</Link>
              </li>
              <li>
                <Link to="/web_sockets">web sockets</Link>
              </li>
            </StyledNav>
            <Outlet />
          </AppRouting>
        </App>
      </SocketIOClientWithDataProvider>
    </QueryClientProvider>
  );
}
