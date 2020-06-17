import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";

class PrivateRoute extends Component {
  render() {
    const isLoggedIn = this.props.login.loggedIn;
    const first_login = _.get(this.props, "user.first_login", false);
    const authorized = _.get(this.props, "otp.authorized", false);
    const { component: Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props => {
          if (isLoggedIn) {
            //Forcing the user to redirect to the profile screen if the user is logged in for the first time
            if (
              first_login &&
              authorized &&
              props.location.pathname != "/profile"
            ) {
              return <Redirect to="/profile" />;
            }
            //Redirecting to customers screen on clicking of browser back button when user logged into the application
            if (
              authorized &&
              (props.match.path == "/verify/:mode" ||
                props.match.path == "/auth")
            ) {
              return <Redirect to="/customer-accounts" />;
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
