import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";

class PrivateRoute extends Component {
  render() {
    const isLoggedIn = this.props.login.loggedIn;
    const first_login = _.get(this.props, "user.first_login", false);
    const { component: Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props => {
          if (isLoggedIn) {
            if (first_login && props.location.pathname != "/profile") {
              return <Redirect to="/profile" />;
            }
            return <Component {...props} />;
          }
          return (
            <Redirect
              to={{
                pathname: "/",
                state: { from: props.location }
              }}
            />
          );
        }}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    login: state.Login.login,
    otp: state.Login.otp,
    user: state.Login.user
  };
}

export default connect(mapStateToProps, null)(PrivateRoute);
