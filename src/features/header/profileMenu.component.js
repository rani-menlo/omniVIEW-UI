import React, { Component } from "react";
import { Dropdown, Avatar, Icon, Menu } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import { LoginActions, CustomerActions } from "../../redux/actions";
import { withRouter } from "react-router-dom";
import { translate } from "../../translations/translator";
import { isLoggedInOmniciaAdmin, isLoggedInCustomerAdmin } from "../../utils";
import { ImageLoader } from "../../uikit/components";

class ProfileMenu extends Component {
  signOut = () => {
    this.props.dispatch(LoginActions.logOut());
    this.props.history.push("/");
  };

  switchAccounts = () => {
    this.props.dispatch(CustomerActions.setSelectedCustomer(null));
    this.props.history.push("/customer-accounts");
  };

  editProfile = () => {
    this.props.history.push("/profile/edit");
  };

  manageUsers = () => {
    this.props.dispatch(
      CustomerActions.setSelectedCustomer(this.props.customer)
    );
    if (this.props.location.pathname === "/usermanagement") {
      this.props.history.push("/usermanagement/parent");
    } else {
      this.props.history.push("/usermanagement");
    }
  };

  getMenu = () => {
    return (
      <Menu className="maindashboard__list__item-dropdown-menu">
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.editProfile}
          disabled={this.props.first_login}
        >
          <p>
            <img src="/images/edit.svg" />
            <span>{`${translate("label.usermgmt.edit")} ${translate(
              "lable.profile.profile"
            )}`}</span>
          </p>
        </Menu.Item>
        {this.props.customerAccounts && this.props.customerAccounts.length > 1 && (
          <Menu.Item
            className="maindashboard__list__item-dropdown-menu-item"
            onClick={this.switchAccounts}
          >
            <p>
              <img
                src="/images/switch-customers.jpeg"
                style={{ width: "20px", marginRight: "6px" }}
              />
              <span>{translate("text.header.switchcustomers")}</span>
            </p>
          </Menu.Item>
        )}
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) && (
          <Menu.Item
            className="maindashboard__list__item-dropdown-menu-item"
            onClick={this.manageUsers}
            disabled={this.props.first_login}
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
    const { user, customerAccounts } = this.props;
    if (!user) {
      return null;
    }
    return (
      <div className="profile">
        {/* <img
          src="/images/help.svg"
          className="profile-help"
          onClick={this.help}
        /> */}
        <Dropdown overlay={this.getMenu()} trigger={["click"]}>
          <div className="profile__menu">
            <ImageLoader
              path={user.profile}
              width="36px"
              height="36px"
              type="circle"
            />
            {/* <Avatar size={36} icon="user" /> */}
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
    first_login: state.Login.first_login,
    selectedCustomer: state.Customer.selectedCustomer,
    customerAccounts: state.Login.customerAccounts,
    customer: state.Login.customer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ProfileMenu)
);
