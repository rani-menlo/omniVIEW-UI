import React, { Component } from "react";
import { connect } from "react-redux";
import { LoginActions } from "../../redux/actions";
import ProfileMenu from "./profileMenu.component";
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
    const { role } = this.props;
    if (!disabled) {
      /**
       * Redirecting to customers screen if the loggin user is Omnicia user
       */
      if (isLoggedInOmniciaRole(role)) {
        history.push("/customers");
        return;
      }
      /**
       * Redirecting to applications screen if the loggin user is other than Omnicia user
       */
      history.push("/applications");
    }
  };
  /**
   * Logout
   */
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
          alt="logo"
          className={`headerbar-logo ${
            disabled ? "global__cursor-not-allowed" : "global__cursor-pointer"
          }`}
          onClick={this.goToMain(history, disabled)}
        />
        {hideMenu ? (
          <div className="headerbar-signout" onClick={this.signOut}>
            <p>
              <img src="/images/logout.svg" alt="logout"/>
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
    role: state.Login.role,
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Header)
);
