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
                <ReactQueryDevtools initialIsOpen={false} />
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

const App = styled.div<{ isDark: boolean }>`
  background-color: ${(props) => (props.isDark ? "#282c34" : "#fff")};
  color: ${(props) => (props.isDark ? "white" : "#282c34")};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: start;
  font-size: calc(10px + 1vmin);
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

// TODO: set debugging scope for socket.io
// current issue for a year
// window.localStorage.setItem("debug", "*");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export default function AppComponent() {
  const memoizedMode = React.useMemo(() => {
    const darkTheme = window.localStorage.getItem("darkTheme");
    return darkTheme === "dark" ? true : false;
  }, []);

  const [darkTheme, setTheme] = React.useState(memoizedMode);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketIOClientWithDataProvider>
        <App isDark={darkTheme}>
          <AppRouting>
            <StyledNav>
              <li>
                <Link to="/">example</Link>
              </li>
              <li className="d-flex gap-2">
                <div>
                  <Link to="/web_sockets">web sockets</Link>
                </div>
                <div className="form-check form-switch">
                  <input
                    id="color-mode-toggler"
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    onChange={() => {
                      setTheme((prev) => {
                        window.localStorage.setItem("darkTheme", !prev ? "dark" : "light");
                        return !prev;
                      });
                    }}
                    checked={darkTheme}
                  />
                  <label className="form-check-label mx-2">{darkTheme ? "dark" : "light"}</label>
                </div>
              </li>
            </StyledNav>
            <Outlet />
          </AppRouting>
        </App>
      </SocketIOClientWithDataProvider>
    </QueryClientProvider>
  );
}
