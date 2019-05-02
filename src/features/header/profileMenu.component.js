import React, { Component } from "react";
import { Dropdown, Avatar, Icon, Menu } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import { LoginActions, CustomerActions } from "../../redux/actions";
import { withRouter } from "react-router-dom";
import { translate } from "../../translations/translator";
import { isLoggedInOmniciaAdmin, isLoggedInCustomerAdmin } from "../../utils";

class ProfileMenu extends Component {
  signOut = () => {
    this.props.dispatch(LoginActions.logOut());
    this.props.history.push("/");
  };

  editProfile = () => {
    this.props.history.push("/profile/edit");
  };

  manageUsers = () => {
    if (this.props.oAdminCustomer) {
      this.props.dispatch(
        CustomerActions.setSelectedCustomer(this.props.oAdminCustomer)
      );
    }
    this.props.history.push("/usermanagement");
  };

  getMenu = () => {
    return (
      <Menu className="maindashboard__list__item-dropdown-menu">
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.editProfile}
        >
          <p>
            <img src="/images/edit.svg" />
            <span>{`${translate("label.usermgmt.edit")} ${translate(
              "lable.profile.profile"
            )}`}</span>
          </p>
        </Menu.Item>
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) && (
          <Menu.Item
            className="maindashboard__list__item-dropdown-menu-item"
            onClick={this.manageUsers}
          >
            <p>
              <img src="/images/user-management.svg" />
              <span>{`${translate("label.generic.manage")} ${translate(
                "label.dashboard.users"
              )}`}</span>
            </p>
          </Menu.Item>
        )}
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.signOut}
        >
          <p>
            <img src="/images/logout.svg" />
            <span>{translate("lable.profile.signout")}</span>
          </p>
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
        {/* <img
          src="/images/help.svg"
          className="profile-help"
          onClick={this.help}
        /> */}
        <Dropdown overlay={this.getMenu()} trigger={["click"]}>
          <div className="profile__menu">
            <Avatar size="small" icon="user" />
            <span className="profile__menu-username">
              {`${_.get(user, "first_name", "")} ${_.get(
                user,
                "last_name",
                ""
              )}`}
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
    user: state.Login.user,
    role: state.Login.role,
    oAdminCustomer: state.Customer.oAdminCustomer
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
