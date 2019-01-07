import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import LoginComponent from "./login.component";

class LoginContainer extends Component {
  static propTypes = {
    loggedIn: PropTypes.bool
  };

  render() {
    const { loggedIn } = this.props;
    return loggedIn ? <Redirect to="/auth" /> : <LoginComponent />;
  }
}

function mapStateToProps(state) {
  return {
    loggedIn: state.Login.loggedIn
  };
}

export default connect(
  mapStateToProps,
  null
)(LoginContainer);
