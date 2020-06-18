import React from "react";
import ReactDOM from "react-dom";
import "./stylesheets/main.scss";
import Routes from "./routes";
import * as serviceWorker from "./serviceWorker";
import { SERVER_URL } from "./constants";

const App = () => <Routes />;

//disabling browser back button
// window.history.pushState(null, null, null);
window.onpopstate = function(event) {
  console.log(
    "onpopstate",
    event.state,
    !event.state,
    event,
    `${SERVER_URL}/verify/email`
  );
  let url = window.location.href == `${SERVER_URL}/verify/email` ? true : false;
  let token = localStorage.getItem("omniview_user_token") ? true : false;
  if (url && token) {
    event.preventDefault();
    window.history.pushState(
      event.state,
      document.title,
      `${SERVER_URL}/customers`
    );
    return;
  }
};

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
