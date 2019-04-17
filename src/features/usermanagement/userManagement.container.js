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
  Pagination
} from "../../uikit/components";
import { DEBOUNCE_TIME } from "../../constants";
import { UsermanagementActions } from "../../redux/actions";
import { Avatar, Dropdown, Menu, Icon } from "antd";
import { translate } from "../../translations/translator";
import { getRoleName, getFormattedDate } from "../../utils";

class UserManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards",
      searchText: "",
      showDeactivateModal: false,
      selectedUser: null,
      pageNo: 1,
      itemsPerPage: 5
    };
    this.searchUsers = _.debounce(this.searchUsers, DEBOUNCE_TIME);
  }

  getMenu = () => {
    return (
      <Menu>
        <Menu.Item disabled>
          <span>Edit Customer</span>
        </Menu.Item>
        <Menu.Item disabled>
          <span>Add/Edit Users</span>
        </Menu.Item>
        <Menu.Item disabled>
          <span>Deactivate Customer</span>
        </Menu.Item>
      </Menu>
    );
  };

  changeView = type => {
    this.setState({ viewBy: type }, () => this.fetchUsers());
  };

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = (sortBy = "first_name", orderBy = "ASC") => {
    const { selectedCustomer } = this.props;
    const { viewBy, pageNo, itemsPerPage, searchText } = this.state;
    if (selectedCustomer) {
      if (viewBy === "lists") {
        this.props.dispatch(
          UsermanagementActions.fetchUsers(
            selectedCustomer.id,
            searchText,
            pageNo,
            itemsPerPage,
            [sortBy],
            orderBy
          )
        );
      } else {
        this.props.dispatch(
          UsermanagementActions.fetchUsers(selectedCustomer.id, searchText)
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
    this.fetchUsers(sortBy, orderBy);
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

  editUser = usr => () => {
    this.props.dispatch(UsermanagementActions.setSelectedUser(usr));
    this.props.history.push("/usermanagement/edit");
  };

  closeModal = () => {
    this.setState({ showDeactivateModal: false });
  };

  deactivate = () => {
    const { selectedCustomer } = this.props;
    this.props.dispatch(
      UsermanagementActions.deactivateUser(
        { userId: this.state.selectedUser.user_id, is_active: 0 },
        selectedCustomer.id,
        this.state.searchText
      )
    );
    this.closeModal();
  };

  openModal = usr => () => {
    const isActive = _.get(usr, "is_active", false);
    isActive && this.setState({ showDeactivateModal: true, selectedUser: usr });
  };

  render() {
    const { searchText, viewBy, pageNo, itemsPerPage } = this.state;
    const { loading, users, selectedCustomer, usersCount } = this.props;
    if (!selectedCustomer) {
      return <Redirect to="/customers" />;
    }
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header />
        <SubHeader>
          <ListViewGridView viewBy={viewBy} changeView={this.changeView} />
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
          {viewBy === "cards" &&
            _.map(users, (user, key) => {
              return (
                <div key={key} className="userManagement__group">
                  <p className="userManagement__group-label">
                    {getRoleName(key, true)}
                  </p>
                  <div className="userManagement__group__users">
                    {_.map(user, usr => {
                      const isActive = _.get(usr, "is_active", false);
                      return (
                        <div
                          key={usr.user_id}
                          className="userManagement__group__users__user"
                        >
                          <Avatar size={48} icon="user" />
                          <div className="userManagement__group__users__user__info">
                            <p className="userManagement__group__users__user__info-name">{`${_.get(
                              usr,
                              "first_name",
                              ""
                            )} ${_.get(usr, "last_name", "")}`}</p>
                            <p className="userManagement__group__users__user__info-text">
                              {translate("label.usermgmt.department")}:{" "}
                              {_.get(usr, "department_name", "")}
                            </p>
                            <p className="userManagement__group__users__user__info-text">
                              {translate("label.usermgmt.subscriptionstatus")}:
                              <span
                                className={`userManagement__group__users__user__info-text-${
                                  isActive ? "active" : "inactive"
                                }`}
                              >
                                {isActive ? " Active" : " Inactive"}
                              </span>
                            </p>
                            <p className="userManagement__group__users__user__info-text">
                              {isActive ? "Expires" : "Expired"}
                              {_.get(usr, "expire")}
                            </p>
                            <p className="userManagement__group__users__user__info-text">
                              {_.get(usr, "email", "")}
                            </p>
                            <div className="global__center-vert">
                              <p
                                className="userManagement__group__users__user__info-link"
                                onClick={this.editUser(usr)}
                              >
                                {translate("label.usermgmt.edit")}
                              </p>
                              <div className="userManagement__group__users__user__info-dot" />
                              <p className="userManagement__group__users__user__info-link">
                                {translate("label.usermgmt.assignlicence")}
                              </p>
                              <div className="userManagement__group__users__user__info-dot" />
                              <p
                                className="userManagement__group__users__user__info-link"
                                onClick={this.openModal(usr)}
                              >
                                {isActive
                                  ? translate("label.usermgmt.deactivate")
                                  : translate("label.usermgmt.activate")}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          {viewBy === "lists" && (
            <React.Fragment>
              <div className="maindashboard__list">
                <TableHeader
                  columns={TableColumns}
                  sortColumn={this.sortColumn}
                />
                {_.map(users, user =>
                  _.map(user, usr => (
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
                            Active
                          </span>
                        ) : (
                          <span className="maindashboard__list__item-text-inactive">
                            Inactive
                          </span>
                        )}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.EXP_DATE)}
                        className="maindashboard__list__item__row maindashboard__list__item-text"
                      >
                        {getFormattedDate(_.get(usr, "expired_date")) ||
                          "11/19/2018"}
                        <Dropdown
                          overlay={this.getMenu()}
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
                  ))
                )}
              </div>
              {searchText && !users.length && (
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
                  usersCount > 4 ? { marginTop: "5%" } : { marginTop: "20%" }
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
            visible={this.state.showDeactivateModal}
            title={translate("label.usermgmt.deactivateacc")}
            content={translate("text.usermgmt.deactivatemsg")}
            closeModal={this.closeModal}
            deactivate={this.deactivate}
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
    width: "12%"
  },
  {
    name: TableColumnNames.DEPARTMENT,
    key: "department_name",
    checkbox: false,
    sort: true,
    width: "15%"
  },
  {
    name: TableColumnNames.EMAIl,
    key: "email",
    checkbox: false,
    sort: true,
    width: "28%"
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
    checkbox: false,
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
