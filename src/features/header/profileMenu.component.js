import React, { Component } from "react";
import { Dropdown, Avatar, Icon, Menu } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import { LoginActions } from "../../redux/actions";
import { withRouter } from "react-router-dom";

class ProfileMenu extends Component {
  onMenuItemClick = e => {
    if (e.key === "signOut") {
      this.props.dispatch(LoginActions.logOut());
      this.props.history.push("/");
    }
  };

  getMenu = () => {
    return (
      <Menu onClick={this.onMenuItemClick}>
        <Menu.Item key="edit" disabled>
          <span className="profilemenu-dropdown-item">Edit Profile</span>
        </Menu.Item>
        <Menu.Item key="signOut">
          <span className="profilemenu-dropdown-item">Sign Out</span>
        </Menu.Item>
        <Menu.Item key="manage" disabled>
          <span className="profilemenu-dropdown-item">Manage Users</span>
        </Menu.Item>
      </Menu>
    );
  };

  help = () => {
    window.open(
      `${window.location.origin}/OmniVIEW How-To Guide.pdf`,
      "_blank"
    );
  };

  render() {
    const { user } = this.props;
    return (
      <div className="profile">
        <img
          src="/images/help.svg"
          className="profile-help"
          onClick={this.help}
        />
        <Dropdown overlay={this.getMenu()} trigger={["click"]}>
          <div className="profile__menu">
            <Avatar size="small" icon="user" />
            <span className="profile__menu-username">
              {_.get(user, "first_name", "")}
            </span>
            <Icon type="down" />
          </div>
        </Dropdown>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.Login.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ProfileMenu)
);
