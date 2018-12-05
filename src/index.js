import React from "react";
import ReactDOM from "react-dom";
import logo from "../assets/images/logo.svg";
import "./stylesheets/main.scss";

const App = () => (
  <img src={logo} alt="logo" style={{ width: 500, height: 500 }} />
);

ReactDOM.render(<App />, document.getElementById("app"));
