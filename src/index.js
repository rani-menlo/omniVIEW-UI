import React from "react";
import ReactDOM from "react-dom";
// import logo from '../assets/images/logo.svg';
// import Login from './features/login/login.component';
import "./stylesheets/main.scss";
import Routes from "./routes";

const App = () => <Routes />;

ReactDOM.render(<App />, document.getElementById("app"));
