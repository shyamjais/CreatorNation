import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import { MoralisProvider } from "react-moralis";
const Moralis = require('moralis');

export const appId = "UvJ4OkYVEqM7nJNXq0U9nbF0oC7qMbhDUE4BgNoL";
export const serverUrl = "https://ejhrfginbtxi.usemoralis.com:2053/server";
Moralis.start({ serverUrl, appId});


ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <App />
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
