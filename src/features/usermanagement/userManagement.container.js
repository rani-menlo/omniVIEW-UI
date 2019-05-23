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
  Text
} from "../../uikit/components";
import { DEBOUNCE_TIME } from "../../constants";
import { UsermanagementActions } from "../../redux/actions";
import { Avatar, Dropdown, Menu, Icon, Popover, Modal } from "antd";
import { translate } from "../../translations/translator";
import { getRoleName, getFormattedDate } from "../../utils";
import PopoverUsersFilter from "./popoverUsersFilter";
import UserCard from "./userCard.component";
import UserProfileCard from "./userProfileCard.component";

class UserManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.selectedFilters = {};
    this.state = {
      viewBy: "cards",
      searchText: "",
      showDeactivateModal: false,
      showUserCard: false,
      selectedUser: null,
      pageNo: 1,
      itemsPerPage: 5
    };
    this.searchUsers = _.debounce(this.searchUsers, DEBOUNCE_TIME);
  }

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
        <Menu.Item
          disabled
          className="maindashboard__list__item-dropdown-menu-item"
        >
          <p>
            <img src="/images/key.svg" />
            <span>{translate("label.usermgmt.assignlicence")}</span>
          </p>
        </Menu.Item>
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.openActivateDeactivateModal(usr)}
        >
          <p
            style={{
              color: _.get(usr, "is_active", false) ? "red" : "#00d592"
            }}
          >
            <img src="/images/deactivate.svg" />
            <span>
              {_.get(usr, "is_active", false)
                ? translate("label.usermgmt.deactivate")
                : translate("label.usermgmt.activate")}
            </span>
          </p>
        </Menu.Item>
      </Menu>
    );
  };

  changeView = type => {
    this.setState({ viewBy: type }, () => this.fetchUsers());
  };

  /* componentDidMount() {
    this.fetchUsers();
  } */

  fetchUsers = () => {
    const { selectedCustomer } = this.props;
    const { viewBy, pageNo, itemsPerPage, searchText } = this.state;
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
  };

  onPageChange = pageNo => {
    this.setState({ pageNo }, () => this.fetchUsers());
  };

  onPageSizeChange = itemsPerPage => {
    this.setState({ itemsPerPage }, () => this.fetchUsers());
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
    this.setState({ showDeactivateModal: false });
  };

  activateDeactivate = () => {
    const { selectedCustomer } = this.props;
    this.props.dispatch(
      UsermanagementActions.activateDeactivateUser(
        {
          userId: this.state.selectedUser.user_id,
          is_active: Number(!_.get(this.state.selectedUser, "is_active", false))
        },
        selectedCustomer.id
      )
    );
    this.closeActivateDeactivateModal();
    this.closeUserCard();
  };

  openActivateDeactivateModal = usr => () => {
    this.setState({ showDeactivateModal: true, selectedUser: usr });
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

    this.fetchUsers();
  };

  openUserCard = usr => () => {
    this.setState({ selectedUser: usr, showUserCard: true });
  };

  closeUserCard = () => {
    this.setState({ showUserCard: false });
  };

  render() {
    const { searchText, viewBy, pageNo, itemsPerPage } = this.state;
    const { loading, selectedCustomer, usersCount } = this.props;
    if (!selectedCustomer) {
      return <Redirect to="/customers" />;
    }

    let users = this.props.users;
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
          <Text
            type="extra_bold"
            size="20px"
            className="userManagement-subheader-title"
            text={selectedCustomer.company_name}
            onClick={this.goBack}
          />
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
                          key={usr.user_id}
                          user={usr}
                          onAvatarClick={this.openUserCard(usr)}
                          onStatusClick={this.openActivateDeactivateModal(usr)}
                          onEdit={this.editUser(usr)}
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
              <div className="maindashboard__list">
                <TableHeader
                  columns={TableColumns}
                  sortColumn={this.sortColumn}
                />
                {_.map(users, usr => (
                  <Row
                    key={usr.id}
                    className="maindashboard__list__item"
                    style={{ justifyContent: "normal" }}
                  >
                    <Column
                      width={getColumnWidth(TableColumnNames.NAME)}
                      className="maindashboard__list__item-text-bold"
                    >
                      {`${_.get(usr, "first_name", "")} ${_.get(
                        usr,
                        "last_name",
                        ""
                      )}`}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.USER_ROLE)}
                      className="maindashboard__list__item-text"
                    >
                      {getRoleName(_.get(usr, "role_name", ""))}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.DEPARTMENT)}
                      className="maindashboard__list__item-text"
                    >
                      {_.get(usr, "department_name", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.EMAIl)}
                      className="maindashboard__list__item-text"
                    >
                      {_.get(usr, "email", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.STATUS)}
                      className="maindashboard__list__item-text"
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
                      width={getColumnWidth(TableColumnNames.EXP_DATE)}
                      className="maindashboard__list__item__row maindashboard__list__item-text"
                    >
                      {getFormattedDate(_.get(usr, "expired_date")) ||
                        "__ /__ /____"}
                      <Dropdown
                        overlay={this.getMenu(usr)}
                        trigger={["click"]}
                        overlayClassName="maindashboard__list__item-dropdown"
                      >
                        <img
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
            isActive={_.get(this.state, "selectedUser.is_active", false)}
            visible={this.state.showDeactivateModal}
            title={
              _.get(this.state, "selectedUser.is_active", false)
                ? `${translate("label.usermgmt.deactivateacc")}?`
                : `${translate("label.usermgmt.activateacc")}?`
            }
            content={
              _.get(this.state, "selectedUser.is_active", false)
                ? translate("text.usermgmt.deactivatemsg")
                : translate("text.usermgmt.activatemsg")
            }
            closeModal={this.closeActivateDeactivateModal}
            deactivate={this.activateDeactivate}
          />
          <UserProfileCard
            visible={this.state.showUserCard}
            user={this.state.selectedUser}
            onClose={this.closeUserCard}
            onEdit={this.editUserFromUserCard}
            onStatusClick={this.openStatusModal}
          />
        </ContentLayout>
      </React.Fragment>
    );
  }
}

const TableColumnNames = {
  NAME: translate("label.user.name"),
  USER_ROLE: translate("label.user.userrole"),
  DEPARTMENT: translate("label.user.department"),
  EMAIl: translate("label.user.email"),
  STATUS: translate("label.user.status"),
  EXP_DATE: translate("label.user.expdate")
};

const TableColumns = [
  {
    name: TableColumnNames.NAME,
    key: "first_name",
    checkbox: false,
    sort: true,
    width: "22%"
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
    width: "27%"
  },
  {
    name: TableColumnNames.STATUS,
    key: "is_active",
    checkbox: false,
    sort: true,
    width: "8%"
  },
  {
    name: TableColumnNames.EXP_DATE,
    key: "expired_date",
    checkbox: false,
    sort: true,
    width: "15%"
  }
];

const getColumnWidth = _.memoize(name => {
  const col = _.find(TableColumns, col => col.name === name);
  return _.get(col, "width");
});

const Column = styled.div`
  width: ${props => props.width};
  padding-left: 0px;
`;

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
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
