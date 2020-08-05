import React, { Component } from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import "./stylesheets/main.scss";
import Routes from "./routes";
import * as serviceWorker from "./serviceWorker";

class App extends Component {
  render() {
    return <Routes />;
  }
}

function mapStateToProps(state) {
  return {
    customerAccounts: state.Login.customerAccounts,
    role: state.Login.role,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

ReactDOM.render(<App />, document.getElementById("root"));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
