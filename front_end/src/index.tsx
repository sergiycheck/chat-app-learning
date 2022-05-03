import React from "react";
import ReactDOM from "react-dom/client";
import "./index-files/index.scss";
import "normalize.css";
import App from "./root/App";
import reportWebVitals from "./index-files/reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
