import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { isLoggedInOmniciaRole } from "./utils";

class PrivateRoute extends Component {
  render() {
    const isLoggedIn = this.props.login.loggedIn;
    const first_login = _.get(this.props, "user.first_login", false);
    const authorized = _.get(this.props, "otp.authorized", false);
    const { component: Component, customerAccounts, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={(props) => {
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
              if (customerAccounts && customerAccounts.length > 1) {
                return <Redirect to="/customer-accounts" />;
              } else {
                if (isLoggedInOmniciaRole(customerAccounts[0].role)) {
                  return <Redirect to="/customers" />;
                }
                return <Redirect to="/applications" />;
              }
            }
            return <Component {...props} />;
          }
          return (
            <Redirect
              to={{
                pathname: "/",
                state: { from: props.location },
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
    user: state.Login.user,
    customerAccounts: state.Login.customerAccounts,
  };
}

export default connect(
  mapStateToProps,
  null
)(PrivateRoute);
