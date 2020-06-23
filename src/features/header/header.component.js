import React, { Component } from "react";
import { connect } from "react-redux";
import { LoginActions } from "../../redux/actions";
import ProfileMenu from "./profileMenu.component";
import { PropTypes } from "prop-types";
import { translate } from "../../translations/translator";
import { withRouter } from "react-router-dom";
import { isLoggedInOmniciaRole } from "../../utils";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  goToMain = (history, disabled) => () => {
    const { customerAccounts } = this.props;
    if (!disabled) {
      if (customerAccounts && customerAccounts.length > 1) {
        history.push("/customer-accounts");
      } else {
        if (isLoggedInOmniciaRole(customerAccounts[0].role)) {
          history.push("/customers");
          return;
        }
        history.push("/applications");
      }
    }
  };

  signOut = () => {
    this.props.dispatch(LoginActions.logOut());
    this.props.history.push("/");
  };

  render() {
    const { style, history, disabled, hideMenu, props } = this.props;
    return (
      <div className="headerbar" style={style}>
        <img
          src="/images/omnicia-logo.svg"
          className={`headerbar-logo ${
            disabled ? "global__cursor-not-allowed" : "global__cursor-pointer"
          }`}
          onClick={this.goToMain(history, disabled)}
        />
        {hideMenu ? (
          <div className="headerbar-signout" onClick={this.signOut}>
            <p>
              <img src="/images/logout.svg" />
              <span>{translate("lable.profile.signout")}</span>
            </p>
          </div>
        ) : (
          <div>
            <ProfileMenu />
          </div>
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

function mapStateToProps(state) {
  return {
    customerAccounts: state.Login.customerAccounts,
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Header)
);
