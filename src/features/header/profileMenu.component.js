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
  /**
   * Logout when user clicks on Signout menu option
   */
  signOut = () => {
    this.props.dispatch(LoginActions.logOut());
    this.props.history.push("/");
  };
  /**
   * Redirecting to the list of customers screen
   */
  switchAccounts = () => {
    this.props.dispatch(CustomerActions.setSelectedCustomer(null));
    this.props.history.push("/customer-accounts");
  };
  /** Redirecting to edit profile screen on clicking of edit profile menu option */
  editProfile = () => {
    this.props.history.push("/profile/edit");
  };
  /**
   * Redirecting to user management screen when user clicks on Manage users menu option
   */
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
  /**
   * Get header menu options
   */
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
        {isLoggedInOmniciaAdmin(this.props.role) && (
          <Menu.Item
            className="maindashboard__list__item-dropdown-menu-item"
            onClick={this.validateApplications}
          >
            <p>
              <img src="/images/manage-app.png" alt="Manage Application" />
              <span>{`${translate("label.generic.manage")} ${translate(
                "label.dashboard.applications"
              )}`}</span>
            </p>
          </Menu.Item>
        )}
        {this.props.customerAccounts && this.props.customerAccounts.length > 1 && (
          <Menu.Item
            className="maindashboard__list__item-dropdown-menu-item"
            onClick={this.switchAccounts}
          >
            <p>
              <img
                src="/images/switch-customer.svg"
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

  /**
   * redirect to validate applications scree
   */
  validateApplications = () => {
    this.props.history.push("/validateApplications");
  };

  render() {
    const { user, customerAccounts } = this.props;
    if (!user) {
      return null;
    }
    return (
      <div className="profile">
        <Dropdown overlay={this.getMenu()} trigger={["click"]}>
          <div className="profile__menu">
            <ImageLoader
              path={user.profile}
              width="36px"
              height="36px"
              type="circle"
            />
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
