import React, { Component } from "react";
import _ from "lodash";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import LoginComponent from "./login.component";

class LoginContainer extends Component {
  static propTypes = {
    login: PropTypes.object
  };

  render() {
    const {
      login: { login, otp }
    } = this.props;
    if (
      _.get(login, "loggedIn") &&
      _.get(otp, "otpReceived") &&
      _.get(otp, "verified")
    ) {
      return <Redirect to="/customers" />;
    } else if (login.loggedIn) {
      return <Redirect to="/auth" />;
    } else {
      return <LoginComponent />;
    }
  }
}

function mapStateToProps(state) {
  return {
    login: state.Login
  };
}

export default connect(
  mapStateToProps,
  null
)(LoginContainer);
