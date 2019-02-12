import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

class PrivateRoute extends Component {
  render() {
    const isLoggedIn = this.props.login.loggedIn;
    const { component: Component, ...rest } = this.props;
    return (
      <Route
        {...rest}
        render={props =>
          isLoggedIn ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: "/",
                state: { from: props.location }
              }}
            />
          )
        }
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    login: state.Login.login,
    otp: state.Login.otp
  };
}

export default connect(
  mapStateToProps,
  null
)(PrivateRoute);
