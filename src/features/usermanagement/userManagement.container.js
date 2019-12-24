import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import _ from "lodash";
import Loader from "../../uikit/components/loader";
import Header from "../header/header.component";
import styled from "styled-components";
import {
  SubHeader,
  SearchBox,
  ContentLayout,
  OmniButton,
  DeactivateModal,
  ListViewGridView,
  TableHeader,
  Row,
  Pagination,
  Text,
  Toast,
  OmniCheckbox
} from "../../uikit/components";
import { DEBOUNCE_TIME, ROLES, ROLE_IDS } from "../../constants";
import {
  UsermanagementActions,
  CustomerActions,
  ApiActions
} from "../../redux/actions";
import { Avatar, Dropdown, Menu, Icon, Popover, Modal } from "antd";
import { translate } from "../../translations/translator";
import {
  getRoleName,
  getFormattedDate,
  isLoggedInOmniciaRole,
  isLoggedInOmniciaAdmin,
  isLoggedInCustomerAdmin
} from "../../utils";
import PopoverUsersFilter from "./popoverUsersFilter";
import UserCard from "./userCard.component";
import UserProfileCard from "./userProfileCard.component";
import PopoverCustomers from "./popoverCustomers.component";
import LicenceInUseUnAssigned from "../license/licenceInUseUnAssigned.component";
import AssignLicence from "../license/assignLicence.component";
import { CustomerApi } from "../../redux/api";
import AccessControl from "../../uikit/components/modal/accessControlModal.component";

class UserManagementContainer extends Component {
  static getDerivedStateFromProps(props, state) {
    if (_.get(props, "users.length") && !_.get(state, "users.length")) {
      return {
        users: _.map(props.users, user => {
          if (user.is_secondary_contact === null) {
            user.is_secondary_contact = false;
          }
          return user;
        })
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.selectedFilters = {};
    this.state = {
      viewBy: "lists",
      searchText: "",
      showDeactivateModal: false,
      showUserCard: false,
      selectedUser: null,
      users: [],
      checkedUsers: [],
      pageNo: 1,
      itemsPerPage: 5,
      showLicenceUnAssignedModal: false,
      showLicenceUnAssignedModalError: "",
      showAccessControlModal: false,
      assigningLicence: null,
      deactivateAll: false,
      markAllSecondary: false,
      showAssignLicenceToUser: false,
      TableColumns: [
        {
          name: TableColumnNames.CHECKBOX,
          checkbox: true,
          checked: false,
          sort: false,
          width: "4%",
          onCheckboxChange: this.checkAll
        },
        {
          name: TableColumnNames.NAME,
          key: "first_name",
          checkbox: false,
          sort: true,
          width: "20%"
        },
        {
          name: TableColumnNames.USER_ROLE,
          key: "role_name",
          checkbox: false,
          sort: true,
          width: "11%"
        },
        {
          name: TableColumnNames.DEPARTMENT,
          key: "department_name",
          checkbox: false,
          sort: true,
          width: "17%"
        },
        {
          name: TableColumnNames.EMAIl,
          key: "email",
          checkbox: false,
          sort: true,
          width: "22%"
        },
        {
          name: TableColumnNames.STATUS,
          key: "is_active",
          checkbox: false,
          sort: true,
          width: "8%"
        },
        {
          name: TableColumnNames.CONTACT,
          key: "is_secondary_contact",
          checkbox: false,
          width: "8%"
        },
        {
          name: TableColumnNames.EXP_DATE,
          key: "expired_date",
          checkbox: false,
          // sort: true,
          width: "10%"
        }
      ]
    };
    this.searchUsers = _.debounce(this.searchUsers, DEBOUNCE_TIME);
  }

  checkAll = e => {
    const checked = _.get(e, "target.checked", false);
    if (!this.state.users.length) {
      e.preventDefault();
      return;
    }
    let checkedUsers = [];
    let users = this.state.users.slice(0, this.state.itemsPerPage);
    users = _.map(users, submission => ({
      ...submission,
      checked
    }));
    if (checked) {
      checkedUsers = [...users];
    } else {
      checkedUsers.length = 0;
    }
    const TableColumns = [...this.state.TableColumns];
    TableColumns[0].checked = checked;
    const allRnotActive = _.every(checkedUsers, ["is_active", false]);
    const allRnotSecondary = _.every(checkedUsers, [
      "is_secondary_contact",
      false
    ]);
    this.setState({
      users,
      TableColumns,
      showGlobalButtons: checkedUsers.length !== 0,
      checkedUsers,
      deactivateAll: !allRnotActive,
      markAllSecondary: allRnotSecondary
    });
  };

  onCheckboxChange = user => e => {
    const checked = e.target.checked;
    const users = this.state.users.slice(0, this.state.itemsPerPage);
    user.checked = checked;

    const TableColumns = [...this.state.TableColumns];
    let showGlobalButtons = false;
    const checkedUsers = [...this.state.checkedUsers];
    if (checked) {
      showGlobalButtons = true;
      checkedUsers.push(user);
    } else {
      _.remove(checkedUsers, user);
      showGlobalButtons = !!checkedUsers.length;
    }
    TableColumns[0].checked = _.every(users, ["checked", true]);
    const allRnotActive = _.every(checkedUsers, ["is_active", false]);
    const allRnotSecondary = _.every(checkedUsers, [
      "is_secondary_contact",
      false
    ]);
    this.setState({
      users,
      TableColumns,
      showGlobalButtons,
      checkedUsers,
      deactivateAll: !allRnotActive,
      markAllSecondary: allRnotSecondary
    });
  };

  openAccessControlModal = user => () => {
    this.setState({ showAccessControlModal: true, selectedUser: user });
  };

  removeUser = usr => () => {
    Modal.confirm({
      className: "omnimodal",
      title: translate("label.generic.delete"),
      content: translate("label.user.areyousuredeleteuser"),
      okText: translate("label.generic.delete"),
      cancelText: translate("label.button.cancel"),
      onOk: () => {
        this.setState({ selectedUser: usr }, this.deleteUser);
      },
      onCancel: () => {
        // this.setState({ selectedUser: null }, this.deleteUser);
      }
    });
  };

  deleteUser = () => {
    const userIds = this.state.selectedUser
      ? [this.state.selectedUser.user_id]
      : _.map(this.state.checkedUsers, "user_id");

    this.props.dispatch(
      UsermanagementActions.deleteusers({ userIds }, async () => {
        Toast.success(`User${userIds.length > 1 ? "s" : ""} deleted!`);
        this.props.dispatch(ApiActions.requestOnDemand());
        const res = await CustomerApi.getCustomerById(
          this.props.selectedCustomer.id
        );
        this.props.dispatch(CustomerActions.setSelectedCustomer(res.data.data));
        this.fetchUsers();
      })
    );
  };

  resendInvitation = usr => () => {
    this.props.dispatch(
      UsermanagementActions.resendInvitationMail(
        { userId: usr.user_id },
        () => {
          Toast.success("Account Activation Email sent.");
        }
      )
    );
  };

  getMenu = usr => () => {
    return (
      <Menu className="maindashboard__list__item-dropdown-menu">
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.editUser(usr)}
        >
          <p>
            <img src="/images/user-management.svg" />
            <span>{`${translate("label.usermgmt.edit")} ${translate(
              "label.dashboard.user"
            )}`}</span>
          </p>
        </Menu.Item>
        {usr.role_id !== ROLE_IDS.OMNICIA.administrator && (
          <Menu.Item
            className="maindashboard__list__item-dropdown-menu-item"
            onClick={this.showLicenceUnAssignedModal(usr)}
          >
            <p>
              <img src="/images/key.svg" />
              <span>{translate("label.usermgmt.assignlicence")}</span>
            </p>
          </Menu.Item>
        )}
        {usr.role_id !== ROLE_IDS.OMNICIA.administrator &&
          this.props.selectedCustomer.is_omnicia && (
            <Menu.Item
              className="maindashboard__list__item-dropdown-menu-item"
              onClick={this.openAccessControlModal(usr)}
            >
              <p>
                <img src="/images/assign.svg" />
                <span>{translate("label.usermgmt.accesscontrol")}</span>
              </p>
            </Menu.Item>
          )}
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.openActivateDeactivateModal(usr)}
        >
          <p
            style={{
              color: _.get(usr, "is_active", false) ? "red" : "#00d592"
            }}
          >
            {_.get(usr, "is_active", false) ? (
              <img src="/images/deactivate.svg" />
            ) : (
              <Icon
                type="check-circle"
                style={{ fontSize: "20px", marginRight: "8px" }}
              />
            )}
            <span>
              {_.get(usr, "is_active", false)
                ? translate("label.usermgmt.deactivate")
                : translate("label.usermgmt.activate")}
            </span>
          </p>
        </Menu.Item>
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) &&
          usr.first_login && (
            <Menu.Item
              className="maindashboard__list__item-dropdown-menu-item"
              onClick={this.resendInvitation(usr)}
            >
              <p className="global__center-vert">
                <Icon
                  type="mail"
                  style={{ fontSize: "20px", marginRight: "8px" }}
                />
                <span>Resend Activation Email</span>
              </p>
            </Menu.Item>
          )}
        {!usr.is_active &&
          usr.user_id != this.props.selectedCustomer.primary_user_id &&
          (isLoggedInOmniciaAdmin(this.props.role) ||
            isLoggedInCustomerAdmin(this.props.role)) && (
            <Menu.Item
              className="maindashboard__list__item-dropdown-menu-item"
              onClick={this.removeUser(usr)}
            >
              <p className="global__text-red">
                <Icon
                  type="delete"
                  theme="filled"
                  style={{ fontSize: "20px", marginRight: "8px" }}
                />
                <span>{translate("label.generic.delete")}</span>
              </p>
            </Menu.Item>
          )}
      </Menu>
    );
  };

  changeView = type => {
    // this.selectedFilters = {};
    this.setState({ viewBy: type }, () => this.fetchUsers());
  };

  /* componentDidMount() {
    this.fetchUsers();
  } */

  fetchUsers = (selectedCustomer = this.props.selectedCustomer) => {
    const { viewBy, pageNo, itemsPerPage, searchText } = this.state;
    this.props.dispatch(UsermanagementActions.resetUsers());
    const TableColumns = [...this.state.TableColumns];
    TableColumns[0].checked = false;
    this.setState(
      { users: [], checkedUsers: [], showGlobalButtons: false, TableColumns },
      () => {
        if (selectedCustomer) {
          if (viewBy === "lists") {
            this.props.dispatch(
              UsermanagementActions.fetchUsers({
                customerId: selectedCustomer.id,
                search: searchText,
                page: pageNo,
                limit: itemsPerPage,
                ...this.selectedFilters
              })
            );
          } else {
            this.props.dispatch(
              UsermanagementActions.fetchUsers({
                customerId: selectedCustomer.id,
                search: searchText,
                ...this.selectedFilters
              })
            );
          }
        }
      }
    );
  };

  onCustomerSelected = customer => {
    this.props.dispatch(CustomerActions.setSelectedCustomer(customer));
    const omniciaRoles = _.map(ROLES.OMNICIA, "id");
    const customerRoles = _.map(ROLES.CUSTOMER, "id");
    const roles = _.get(customer, "is_omnicia", false)
      ? omniciaRoles
      : customerRoles;

    if (this.selectedFilters.roles) {
      const diff = _.difference(this.selectedFilters.roles, roles);
      if (diff.length) {
        this.selectedFilters.roles = _.map(this.selectedFilters.roles, role =>
          role < 4 ? role + 3 : role - 3
        );
      }
    }

    this.fetchUsers(customer);
  };

  onPageChange = pageNo => {
    this.setState({ pageNo }, () => this.fetchUsers());
  };

  onPageSizeChange = itemsPerPage => {
    this.setState({ itemsPerPage, pageNo: 1 }, () => this.fetchUsers());
  };

  sortColumn = (sortBy, orderBy) => {
    this.selectedFilters = {
      ...this.selectedFilters,
      sortBy: [sortBy],
      order: orderBy
    };
    this.fetchUsers();
  };

  handleSearch = e => {
    const searchText = e.target.value;
    this.setState({ searchText });
    if (searchText === "" || _.size(searchText) >= 3) {
      this.searchUsers();
    }
  };

  searchUsers = () => {
    this.fetchUsers();
  };

  clearSearch = () => {
    this.setState({ searchText: "" });
    this.searchUsers();
  };

  openAdduser = () => {
    this.props.dispatch(UsermanagementActions.resetLicences());
    this.props.history.push("/usermanagement/add");
  };

  goBack = () => {
    this.props.history.goBack();
  };

  editUser = usr => () => {
    this.props.dispatch(UsermanagementActions.setSelectedUser(usr));
    this.props.history.push("/usermanagement/edit");
  };

  editUserFromUserCard = () => {
    this.closeUserCard();
    this.editUser(this.state.selectedUser)();
  };

  closeActivateDeactivateModal = () => {
    this.setState({ showDeactivateModal: false, selectedUser: null });
  };

  activateDeactivate = () => {
    const users = {
      users: this.state.selectedUser
        ? [
            {
              userId: this.state.selectedUser.user_id,
              is_active: Number(
                !_.get(this.state.selectedUser, "is_active", false)
              )
            }
          ]
        : _.map(this.state.checkedUsers, user => ({
            userId: user.user_id,
            is_active: this.state.deactivateAll ? 0 : 1
          }))
    };

    this.props.dispatch(
      UsermanagementActions.activateDeactivateUser(users, async () => {
        if (_.get(users, ["users", "0", "is_active"]) === 1) {
          Toast.success("User has been activated!");
        } else {
          Toast.success("User has been deactivated!");
        }
        this.props.dispatch(ApiActions.requestOnDemand());
        const res = await CustomerApi.getCustomerById(
          this.props.selectedCustomer.id
        );
        this.props.dispatch(CustomerActions.setSelectedCustomer(res.data.data));
        this.fetchUsers();
      })
    );
    this.closeActivateDeactivateModal();
    this.closeUserCard();
  };

  openActivateDeactivateModal = usr => () => {
    this.setState({ showDeactivateModal: true, selectedUser: usr });
  };

  openOnlyDeactivateModal = () => {
    this.state.showGlobalButtons &&
      this.setState({ showDeactivateModal: true, selectedUser: null });
  };

  openStatusModal = () => {
    this.openActivateDeactivateModal(this.state.selectedUser)();
  };

  onFiltersUpdate = filters => {
    this.selectedFilters = {
      ...this.selectedFilters,
      ...filters,
      sortBy: filters.sortBy && [filters.sortBy]
    };

    // if filters applied in the middle of the pagination
    // then take user to first page
    if (this.state.pageNo > 1) {
      this.onPageChange(1);
      return;
    }

    this.fetchUsers();
  };

  openUserCard = usr => () => {
    this.setState({ selectedUser: usr, showUserCard: true });
  };

  closeUserCard = () => {
    this.setState({ showUserCard: false });
  };

  showLicenceUnAssignedModal = user => () => {
    this.setState({
      selectedUser: user,
      showLicenceUnAssignedModal: true,
      showUserCard: false
    });
  };

  goBackToUnAssignedModal = () => {
    this.setState({
      showAssignLicenceToUser: false,
      showLicenceUnAssignedModal: true
    });
  };

  closeLicenseUnAssignedModal = () => {
    this.setState({
      showLicenceUnAssignedModal: false,
      showLicenceUnAssignedModalError: ""
    });
  };

  onAssignLicenseClick = license => {
    if (license.licences.length < this.state.selectedUser.length) {
      this.setState({
        showLicenceUnAssignedModalError: translate(
          "error.licence.maxuserselected"
        )
      });
      return;
    }
    this.setState({
      showLicenceUnAssignedModal: false,
      showLicenceUnAssignedModalError: "",
      showAssignLicenceToUser: true,
      assigningLicence: license
    });
  };

  closeAssignLicenceToUserModal = () => {
    this.setState({
      showAssignLicenceToUser: false
    });
  };

  assignLicence = () => {
    const { assigningLicence, selectedUser } = this.state;
    let licenses = [];
    let toastMsg = "Licenses have been assigned.";
    if (_.isArray(selectedUser)) {
      licenses = _.map(selectedUser, (user, idx) => {
        const licence = assigningLicence.licences[idx];
        return {
          ...(_.includes(licence.slug, "view")
            ? { omni_view_license: licence.id }
            : { omni_file_license: licence.id }),
          user_id: user.user_id
        };
      });
    } else {
      const licence = assigningLicence.licences[0];
      licenses = [
        {
          ...(_.includes(licence.slug, "view")
            ? { omni_view_license: licence.id }
            : { omni_file_license: licence.id }),
          user_id: selectedUser.user_id
        }
      ];
      toastMsg = "License has been assigned.";
    }
    this.props.dispatch(
      UsermanagementActions.assignLicense(
        {
          licenses
        },
        async () => {
          Toast.success(toastMsg);
          this.fetchUsers();
          this.props.dispatch(ApiActions.requestOnDemand());
          const res = await CustomerApi.getCustomerById(
            this.props.selectedCustomer.id
          );
          this.props.dispatch(
            CustomerActions.setSelectedCustomer(res.data.data)
          );
          this.props.dispatch(ApiActions.successOnDemand());
        }
      )
    );
    this.setState({
      showAssignLicenceToUser: false,
      showLicenceUnAssignedModal: false
    });
  };

  getColumnWidth = _.memoize(name => {
    const col = _.find(this.state.TableColumns, col => col.name === name);
    return _.get(col, "width");
  });

  openSecondaryContact = () => {
    this.state.showGlobalButtons &&
      Modal.confirm({
        className: "omnimodal",
        title: translate("label.user.seccontact"),
        content: this.state.markAllSecondary
          ? translate("label.user.areyousuremarkseccontact")
          : translate("label.user.areyousureunmarkseccontact"),
        okText: translate("label.button.continue"),
        cancelText: translate("label.button.cancel"),
        onOk: () => {
          this.updateSecondaryContact();
        }
      });
  };

  updateSecondaryContact = () => {
    const users = _.map(this.state.checkedUsers, user => ({
      userId: user.user_id,
      is_secondary_contact: this.state.markAllSecondary ? 1 : 0
    }));

    this.props.dispatch(
      UsermanagementActions.updateSecondaryContacts({ users }, () => {
        Toast.success("Updated Sceondary Contact list!");
        this.fetchUsers();
      })
    );
  };

  closeAccessControlModal = () => {
    this.setState({ showAccessControlModal: false });
  };

  hasDeactivatedUsers = () => {
    if (!this.state.checkedUsers.length) {
      return false;
    }
    const allRdeactivated = _.every(this.state.checkedUsers, [
      "is_active",
      false
    ]);
    return allRdeactivated;
  };

  render() {
    const {
      searchText,
      viewBy,
      pageNo,
      itemsPerPage,
      showLicenceUnAssignedModal,
      showLicenceUnAssignedModalError,
      showAssignLicenceToUser,
      assigningLicence,
      showAccessControlModal
    } = this.state;
    const { loading, selectedCustomer, usersCount } = this.props;
    if (!selectedCustomer) {
      return <Redirect to="/customers" />;
    }

    let users = this.state.users;
    if (viewBy === "cards") {
      const usersByRole = _.groupBy(users, "role_name");
      let mergedRoles = {};
      _.map(usersByRole, (array, role) => {
        const trimmedRole = role.substring(role.indexOf("_") + 1);
        let newArray = mergedRoles[trimmedRole] || [];
        newArray = [...newArray, ...usersByRole[role]];
        mergedRoles[trimmedRole] = newArray;
      });
      users = {};
      _(mergedRoles)
        .keys()
        .sort()
        .each(key => {
          users[key] = mergedRoles[key];
        });
    }

    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header />
        <SubHeader>
          <ListViewGridView viewBy={viewBy} changeView={this.changeView} />
          <PopoverUsersFilter
            onFiltersUpdate={this.onFiltersUpdate}
            selectedCustomer={selectedCustomer}
          />
          {!isLoggedInOmniciaAdmin(this.props.role) && (
            <Row style={{ marginLeft: "auto" }}>
              <Text
                type="extra_bold"
                size="20px"
                className="userManagement-subheader-title"
                text={selectedCustomer.company_name}
                onClick={this.goBack}
              />
            </Row>
          )}
          {isLoggedInOmniciaAdmin(this.props.role) && (
            <Popover
              trigger="click"
              placement="bottom"
              content={
                <PopoverCustomers
                  onCustomerSelected={this.onCustomerSelected}
                />
              }
            >
              <Row style={{ marginLeft: "auto" }}>
                <Text
                  type="extra_bold"
                  size="20px"
                  className="userManagement-subheader-title"
                  text={selectedCustomer.company_name}
                  // onClick={this.goBack}
                />
                <img
                  className="global__cursor-pointer"
                  src="/images/caret-inactive.svg"
                  style={{ marginLeft: "5px" }}
                />
              </Row>
            </Popover>
          )}
          <div style={{ marginLeft: "auto" }}>
            <SearchBox
              placeholder={translate("text.header.search", {
                type: translate("label.dashboard.users")
              })}
              searchText={searchText}
              clearSearch={this.clearSearch}
              onChange={this.handleSearch}
            />
          </div>
        </SubHeader>
        <ContentLayout className="userManagement">
          <div className="userManagement__header">
            {translate("label.usermgmt.title")}
            <OmniButton
              type="add"
              label={translate("label.button.add", {
                type: translate("label.dashboard.user")
              })}
              className="userManagement__header-addButton"
              onClick={this.openAdduser}
            />
          </div>
          {viewBy === "cards" && (
            <div>
              {_.map(users, (user, key) => {
                return (
                  <div key={key} className="userManagement__group">
                    <p className="userManagement__group-label">
                      {getRoleName(key, true)}
                    </p>
                    <div className="userManagement__group__users">
                      {_.map(user, usr => (
                        <UserCard
                          menu={this.getMenu}
                          key={usr.user_id}
                          user={usr}
                          onAvatarClick={this.openUserCard(usr)}
                          onStatusClick={this.openActivateDeactivateModal(usr)}
                          onEdit={this.editUser(usr)}
                          onAssignLicenseClick={this.showLicenceUnAssignedModal(
                            usr
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {!_.size(users) && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.notfound", {
                    type: translate("label.dashboard.users")
                  })}
                </Row>
              )}
            </div>
          )}
          {viewBy === "lists" && (
            <React.Fragment>
              <div className="global__center-vert">
                <OmniButton
                  type="primary"
                  disabled={!this.state.showGlobalButtons}
                  label={translate("label.usermgmt.assignlicence")}
                  buttonStyle={{
                    marginRight: "8px"
                  }}
                  onClick={this.showLicenceUnAssignedModal(
                    this.state.checkedUsers
                  )}
                />
                <OmniButton
                  type="primary"
                  disabled={!this.state.showGlobalButtons}
                  buttonStyle={{
                    marginRight: "8px"
                  }}
                  label={
                    this.state.deactivateAll
                      ? translate("label.usermgmt.deactivate")
                      : translate("label.usermgmt.activate")
                  }
                  onClick={this.openOnlyDeactivateModal}
                />
                <OmniButton
                  type="primary"
                  disabled={!this.state.showGlobalButtons}
                  buttonStyle={{
                    marginRight: "8px"
                  }}
                  label={`${
                    this.state.markAllSecondary
                      ? translate("label.generic.tag")
                      : translate("label.generic.untag")
                  } ${translate("label.user.seccontact")}`}
                  onClick={this.openSecondaryContact}
                />
                <OmniButton
                  type="primary"
                  disabled={!this.hasDeactivatedUsers()}
                  label={translate("label.generic.delete")}
                  onClick={this.removeUser()}
                />
              </div>
              <div className="maindashboard__list">
                <TableHeader
                  columns={this.state.TableColumns}
                  sortColumn={this.sortColumn}
                />
                {_.map(users, usr => (
                  <Row
                    key={usr.id}
                    className="maindashboard__list__item"
                    style={{ justifyContent: "normal", cursor: "default" }}
                  >
                    <Column
                      width={this.getColumnWidth(TableColumnNames.CHECKBOX)}
                    >
                      <OmniCheckbox
                        checked={usr.checked}
                        onCheckboxChange={this.onCheckboxChange(usr)}
                      />
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.NAME)}
                      className="maindashboard__list__item-text-bold global__cursor-pointer"
                      onClick={this.openUserCard(usr)}
                    >
                      {`${_.get(usr, "first_name", "")} ${_.get(
                        usr,
                        "last_name",
                        ""
                      )}`}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.USER_ROLE)}
                      className="maindashboard__list__item-text"
                    >
                      {getRoleName(_.get(usr, "role_name", ""))}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.DEPARTMENT)}
                      className="maindashboard__list__item-text"
                    >
                      {_.get(usr, "department_name", "")}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.EMAIl)}
                      className="maindashboard__list__item-text"
                    >
                      {_.get(usr, "email", "")}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.STATUS)}
                      className="maindashboard__list__item-text"
                      style={{ paddingLeft: "5px" }}
                    >
                      {_.get(usr, "is_active", false) ? (
                        <span className="maindashboard__list__item-text-active">
                          {translate("label.user.active")}
                        </span>
                      ) : (
                        <span className="maindashboard__list__item-text-inactive">
                          {translate("label.user.inactive")}
                        </span>
                      )}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.CONTACT)}
                      className="maindashboard__list__item-text"
                    >
                      {_.get(usr, "is_secondary_contact")
                        ? translate("label.generic.yes")
                        : translate("label.generic.no")}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.EXP_DATE)}
                      className="maindashboard__list__item__row maindashboard__list__item-text"
                    >
                      {getFormattedDate(_.get(usr, "expiryDate")) ||
                        "__ /__ /____"}
                      <Dropdown
                        overlay={this.getMenu(usr)}
                        trigger={["click"]}
                        overlayClassName="maindashboard__list__item-dropdown"
                      >
                        <img
                          className="global__cursor-pointer"
                          src="/images/overflow-black.svg"
                          style={{ width: "18px", height: "18px" }}
                        />
                      </Dropdown>
                    </Column>
                  </Row>
                ))}
              </div>
              {!users.length && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.notfound", {
                    type: translate("label.dashboard.users")
                  })}
                </Row>
              )}
              <Pagination
                key={usersCount}
                containerStyle={
                  usersCount > 4 ? { marginTop: "1%" } : { marginTop: "20%" }
                }
                total={usersCount}
                showTotal={(total, range) =>
                  translate("text.pagination", {
                    top: range[0],
                    bottom: range[1],
                    total,
                    type: translate("label.dashboard.users")
                  })
                }
                pageSize={itemsPerPage}
                current={pageNo}
                onPageChange={this.onPageChange}
                onPageSizeChange={this.onPageSizeChange}
              />
            </React.Fragment>
          )}
          <DeactivateModal
            isActive={
              !_.isNull(this.state.selectedUser)
                ? _.get(this.state, "selectedUser.is_active")
                : this.state.deactivateAll
            }
            visible={this.state.showDeactivateModal}
            title={
              (!_.isNull(this.state.selectedUser)
              ? _.get(this.state, "selectedUser.is_active")
              : this.state.deactivateAll)
                ? `${translate("label.usermgmt.deactivateacc")}?`
                : `${translate("label.usermgmt.activateacc")}?`
            }
            content={
              (!_.isNull(this.state.selectedUser)
              ? _.get(this.state, "selectedUser.is_active")
              : this.state.deactivateAll)
                ? translate("text.usermgmt.deactivatemsg")
                : translate("text.usermgmt.activatemsg")
            }
            closeModal={this.closeActivateDeactivateModal}
            submit={this.activateDeactivate}
          />
          <UserProfileCard
            key={_.get(this.state, "selectedUser.profile")}
            visible={this.state.showUserCard}
            user={this.state.selectedUser}
            onClose={this.closeUserCard}
            onEdit={this.editUserFromUserCard}
            onAssignLicence={this.showLicenceUnAssignedModal(
              this.state.selectedUser
            )}
            onStatusClick={this.openStatusModal}
          />
          {showLicenceUnAssignedModal && (
            <LicenceInUseUnAssigned
              type="unassigned"
              error={showLicenceUnAssignedModalError}
              visible={showLicenceUnAssignedModal}
              closeModal={this.closeLicenseUnAssignedModal}
              customer={this.props.selectedCustomer}
              onAssignLicenseClick={this.onAssignLicenseClick}
            />
          )}
          {showAccessControlModal && (
            <AccessControl
              visible={showAccessControlModal}
              user={this.state.selectedUser}
              closeModal={this.closeAccessControlModal}
            />
          )}
          <AssignLicence
            visible={showAssignLicenceToUser}
            licence={assigningLicence}
            users={this.state.selectedUser}
            closeModal={this.closeAssignLicenceToUserModal}
            back={this.goBackToUnAssignedModal}
            submit={this.assignLicence}
          />
        </ContentLayout>
      </React.Fragment>
    );
  }
}

const TableColumnNames = {
  CHECKBOX: "",
  NAME: translate("label.user.name"),
  USER_ROLE: translate("label.user.userrole"),
  DEPARTMENT: translate("label.user.department"),
  EMAIl: translate("label.user.email"),
  CONTACT: translate("label.user.seccontact"),
  STATUS: translate("label.user.accstatus"),
  EXP_DATE: translate("label.user.expdate")
};

const Column = styled.div`
  width: ${props => props.width};
  padding-left: 0px;
`;

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    selectedCustomer: state.Customer.selectedCustomer,
    users: state.Usermanagement.users,
    usersCount: state.Usermanagement.usersCount
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserManagementContainer);
