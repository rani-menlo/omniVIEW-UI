import React, { Component } from "react";
import _ from "lodash";
import { Icon, Dropdown, Menu } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import CustomerCard from "../customerCard.component";
import { CustomerActions, UsermanagementActions } from "../../../redux/actions";
import Header from "../../header/header.component";
import { isLoggedInOmniciaRole, isLoggedInOmniciaAdmin } from "../../../utils";
import {
  Loader,
  TableHeader,
  Row,
  Pagination,
  OmniCheckbox,
  OmniButton,
  SearchBox,
  ListViewGridView,
  SubHeader,
  ContentLayout,
  DeactivateModal,
  Toast,
} from "../../../uikit/components";
import { DEBOUNCE_TIME, SERVER_URL } from "../../../constants";
import { translate } from "../../../translations/translator";
import LicenceInUseUnAssigned from "../../license/licenceInUseUnAssigned.component";
import AssignLicenceWithUsers from "../../license/assignLicenceWithUsers.component";
import AssignLicence from "../../license/assignLicence.component";

class CustomerDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards",
      pageNo: 1,
      itemsPerPage: 5,
      searchText: "",
      selectedCustomer: "",
      showDeactivateModal: false,
      showSubscriptionsInUse: false,
      showLicenceUnAssigned: false,
      showUsersModal: false,
      showAssignLicenceToUser: false,
      assigningLicence: null,
      selectedUsers: null,
    };
    this.searchCustomers = _.debounce(this.searchCustomers, DEBOUNCE_TIME);
  }

  onBackButtonEvent = (e) => {
    e.preventDefault();
    if (!this.isBackButtonClicked) {
      window.history.pushState(null, null, window.location.pathname);
      this.isBackButtonClicked = false;
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener("popstate", this.onBackButtonEvent);
  };

  componentDidMount() {
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", this.onBackButtonEvent);
    if (isLoggedInOmniciaRole(this.props.role)) {
      this.fetchCustomers();
    } else {
      const { customer } = this.props;
      this.onCustomerSelected({ ...customer })();
    }
  }
  /**
   * Fetching customers
   * @param {*} sortBy
   * @param {*} orderBy
   */
  fetchCustomers = (sortBy = "company_name", orderBy = "ASC") => {
    const { viewBy, pageNo, itemsPerPage, searchText } = this.state;
    /**
     * Fetching the customerss in list view
     */
    if (viewBy === "lists") {
      this.props.actions.fetchCustomersByList(
        pageNo,
        itemsPerPage,
        sortBy,
        orderBy,
        searchText || ""
      );
    } else {
      this.props.actions.fetchCustomers(searchText || "");
    }
  };
  /**
   * Changing the view to display the customers (list <-> Card)
   * @param {*} type
   */
  changeView = (type) => {
    this.setState({ viewBy: type }, () => this.fetchCustomers());
  };
  /**
   * When user selects the customer to access the applications
   * realted to the selected customer
   * @param {*} customer
   */
  onCustomerSelected = (customer) => () => {
    this.props.actions.setSelectedCustomer(customer);
    this.props.history.push("/applications");
  };
  /**
   * Opening the active licenses modal
   * @param {*} customer
   */
  subscriptionsInUse = (customer) => (event) => {
    event.stopPropagation();
    isLoggedInOmniciaAdmin(this.props.role) &&
      this.setState({
        selectedCustomer: customer,
        showSubscriptionsInUse: true,
        showLicenceUnAssigned: false,
      });
  };
  /**
   * Opening the available licenses modal
   * @param {*} customer
   */
  subscriptionsUnAssigned = (customer) => (event) => {
    event.stopPropagation();
    isLoggedInOmniciaAdmin(this.props.role) &&
      this.setState({
        selectedCustomer: customer,
        showLicenceUnAssigned: true,
        showSubscriptionsInUse: false,
      });
  };
  /**
   * Closing the active licenses modal
   */
  closeSubscriptionsModal = () => {
    this.setState({
      showSubscriptionsInUse: false,
      showLicenceUnAssigned: false,
    });
  };
  /**
   * Redirecting to the edit customer screen to edit the selected customer
   * @param {*} customer
   */
  editCustomer = (customer) => () => {
    this.props.actions.setSelectedCustomer(customer);
    this.props.history.push("/usermanagement/customer/edit");
  };
  /**
   * To get menu options for the individial customer
   * @param {*} customer
   */
  getMenu = (customer) => () => {
    return (
      <Menu className="maindashboard__list__item-dropdown-menu">
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.editCustomer(customer)}
        >
          <p>
            <img src="/images/edit.svg" />
            <span>{`${translate("label.usermgmt.edit")} ${translate(
              "label.dashboard.customer"
            )}`}</span>
          </p>
        </Menu.Item>
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.openUserMgmt(customer)}
        >
          <p>
            <img src="/images/user-management.svg" />
            <span>{translate("label.usermgmt.title")}</span>
          </p>
        </Menu.Item>
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item"
          onClick={this.openActivateDeactivateModal(customer)}
        >
          <p
            style={{
              color: _.get(customer, "is_active", false) ? "red" : "#00d592",
            }}
          >
            <img src="/images/deactivate.svg" />
            <span>{`${
              _.get(customer, "is_active", false)
                ? translate("label.usermgmt.deactivate")
                : translate("label.usermgmt.activate")
            } ${translate("label.dashboard.customer")}`}</span>
          </p>
        </Menu.Item>
      </Menu>
    );
  };
  /**
   * On changing the page in the list view
   * @param {*} pageNo
   */
  onPageChange = (pageNo) => {
    this.setState({ pageNo }, () => this.fetchCustomers());
  };
  /**
   * On changing the size of the records per the page to display
   * @param {*} itemsPerPage
   */
  onPageSizeChange = (itemsPerPage) => {
    this.setState({ itemsPerPage }, () => this.fetchCustomers());
  };
  /**
   * Sorting the columns in the list view
   * @param {*} sortBy
   * @param {*} orderBy
   */
  sortColumn = (sortBy, orderBy) => {
    this.fetchCustomers(sortBy, orderBy);
  };
  /**
   * Search
   * @param {*} e
   */
  handleSearch = (e) => {
    const searchText = e.target.value;
    this.setState({ searchText });
    if (searchText === "" || _.size(searchText) >= 3) {
      this.searchCustomers();
    }
  };
  /**
   * Search for customers by customer
   */
  searchCustomers = () => {
    this.fetchCustomers();
  };
  /**
   * Clear the search value in the texbox
   */
  clearSearch = () => {
    this.setState({ searchText: "" });
    this.searchCustomers();
  };
  /**
   * Adding the customer
   */
  addCustomer = () => {
    this.props.dispatch(UsermanagementActions.resetAllLicences());
    this.props.actions.setSelectedCustomer(null);
    setTimeout(
      () => this.props.history.push("/usermanagement/customer/add"),
      100
    );
  };
  /**
   * Opening the user manangement screen
   */
  openOadminUserManagement = () => {
    const { customer } = this.props;
    this.openUserMgmt(customer)();
  };

  openUserMgmt = (customer) => () => {
    this.props.actions.setSelectedCustomer(customer);
    this.props.history.push("/usermanagement");
  };
  /**
   * Close deactive customer modal
   */
  closeActivateDeactivateModal = () => {
    this.setState({ showDeactivateModal: false });
  };
  /**
   * Opening the delete customer modal
   */
  activateDeactivate = () => {
    const { selectedCustomer, searchText } = this.state;
    this.props.dispatch(
      CustomerActions.activateDeactivateCustomer(
        {
          customerId: selectedCustomer.id,
          is_active: +!_.get(selectedCustomer, "is_active", false),
        },
        _.size(searchText) >= 3 ? searchText : ""
      )
    );
    this.closeActivateDeactivateModal();
  };

  openActivateDeactivateModal = (customer) => () => {
    this.setState({ showDeactivateModal: true, selectedCustomer: customer });
  };

  openUsersModal = (license) => {
    this.props.dispatch(
      CustomerActions.setSelectedCustomer(this.state.selectedCustomer)
    );
    this.setState({
      showLicenceUnAssigned: false,
      showAssignLicenceToUser: false,
      showUsersModal: true,
      assigningLicence: license,
    });
  };

  goBackToUsersModal = () => {
    this.setState({
      showAssignLicenceToUser: false,
      showUsersModal: true,
    });
  };

  closeUsersModal = () => {
    this.setState({
      selectedUsers: null,
      showUsersModal: false,
      assigningLicence: null,
    });
  };

  closeAssignLicenceToUserModal = () => {
    this.setState({
      selectedUsers: null,
      showAssignLicenceToUser: false,
    });
  };

  onUserSelect = (users) => {
    this.setState({
      showAssignLicenceToUser: true,
      showUsersModal: false,
      selectedUsers: users,
    });
  };

  assignLicence = () => {
    const { assigningLicence, selectedUsers } = this.state;
    const licenses = _.map(selectedUsers, (user, idx) => {
      const licence = assigningLicence.licences[idx];
      return {
        ...(_.includes(licence.slug, "view")
          ? { omni_view_license: licence.id }
          : { omni_file_license: licence.id }),
        user_id: user.user_id,
      };
    });
    this.props.dispatch(
      UsermanagementActions.assignLicense(
        {
          licenses,
        },
        () => {
          Toast.success("License has been assigned.");
          this.fetchCustomers();
        }
      )
    );
    this.setState({
      selectedUsers: null,
      showAssignLicenceToUser: false,
    });
  };

  render() {
    const {
      viewBy,
      searchText,
      showSubscriptionsInUse,
      showLicenceUnAssigned,
      showUsersModal,
    } = this.state;
    const { customers, loading, customerCount, role } = this.props;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header />
        <SubHeader>
          <ListViewGridView viewBy={viewBy} changeView={this.changeView} />
          {/* <div className="maindashboard__header__icon maindashboard__header__icon-filter">
              <img src={FilterIcon} />
            </div>
            <span className="maindashboard__header-filter-text">
              Filters: Off
            </span> */}
          <div style={{ marginLeft: "auto" }}>
            <SearchBox
              placeholder={translate("text.header.search", {
                type: translate("label.dashboard.customers"),
              })}
              searchText={searchText}
              clearSearch={this.clearSearch}
              onChange={this.handleSearch}
            />
          </div>
        </SubHeader>
        <ContentLayout className="maindashboard">
          <div className="maindashboard__header">
            <div className="global__center-vert">
              <span className="maindashboard__header-customers">
                {translate("label.dashboard.customers")}
              </span>
              {isLoggedInOmniciaAdmin(role) && (
                <div
                  className="maindashboard__header__addEdit"
                  onClick={this.openOadminUserManagement}
                >
                  {translate("label.usermgmt.title")}
                </div>
              )}
            </div>
            {isLoggedInOmniciaAdmin(role) && (
              <OmniButton
                type="add"
                label={translate("label.button.add", {
                  type: translate("label.dashboard.customer"),
                })}
                onClick={this.addCustomer}
                // className="global__disabled-box"
              />
            )}
          </div>
          {viewBy === "lists" && (
            <React.Fragment>
              <div className="maindashboard__list">
                <TableHeader
                  columns={TableColumns}
                  sortColumn={this.sortColumn}
                />
                {_.map(customers, (customer) => (
                  <Row
                    key={customer.id}
                    className="maindashboard__list__item"
                    style={{
                      opacity: _.get(customer, "is_active", false) ? 1 : 0.5,
                    }}
                  >
                    <Column
                      width={getColumnWidth(TableColumnNames.CUSTOMER_NAME)}
                      className="maindashboard__list__item-text-bold"
                      onClick={this.onCustomerSelected(customer)}
                    >
                      {_.get(customer, "company_name", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.USERS)}
                      className="maindashboard__list__item-text"
                      onClick={this.onCustomerSelected(customer)}
                    >
                      {_.get(customer, "number_of_users", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.APPLICATIONS)}
                      className="maindashboard__list__item-text"
                      onClick={this.onCustomerSelected(customer)}
                    >
                      {_.get(customer, "number_of_submissions", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.STORAGE)}
                      className="maindashboard__list__item-text"
                      onClick={this.onCustomerSelected(customer)}
                    >
                      {_.get(customer, "max_space") || "0"} TB
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.COMPANY_ADMIN)}
                      className="maindashboard__list__item-text"
                      onClick={this.onCustomerSelected(customer)}
                    >
                      {_.get(customer, "admin_name", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.SUBSCRIPTION)}
                      className="maindashboard__list__item__row maindashboard__list__item-text"
                    >
                      <p>
                        <span onClick={this.subscriptionsInUse(customer)}>
                          {`${_.get(
                            customer,
                            "assigned_licenses",
                            0
                          )} ${translate("label.generic.inuse")} | `}
                        </span>
                        <span
                          onClick={this.subscriptionsUnAssigned(customer)}
                        >{`${_.get(customer, "revoked_licenses", 0) +
                          _.get(
                            customer,
                            "unassigned_licenses",
                            0
                          )} ${translate("label.generic.unassigned")}`}</span>
                      </p>
                      {isLoggedInOmniciaAdmin(role) && (
                        <Dropdown
                          overlay={this.getMenu(customer)()}
                          trigger={["click"]}
                          overlayClassName="maindashboard__list__item-dropdown"
                        >
                          <img
                            className="global__cursor-pointer"
                            src="/images/overflow-black.svg"
                            style={{ width: "18px", height: "18px" }}
                          />
                        </Dropdown>
                      )}
                    </Column>
                  </Row>
                ))}
              </div>
              {searchText && !customers.length && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.notfound", {
                    type: translate("label.dashboard.customers"),
                  })}
                </Row>
              )}
              <Pagination
                containerStyle={
                  customerCount > 4 ? { marginTop: "1%" } : { marginTop: "20%" }
                }
                total={customerCount}
                showTotal={(total, range) =>
                  translate("text.pagination", {
                    top: range[0],
                    bottom: range[1],
                    total,
                    type: translate("label.dashboard.customers"),
                  })
                }
                pageSize={this.state.itemsPerPage}
                current={this.state.pageNo}
                onPageChange={this.onPageChange}
                onPageSizeChange={this.onPageSizeChange}
              />
            </React.Fragment>
          )}
          {viewBy === "cards" && (
            <React.Fragment>
              <div className="maindashboard__cards">
                {_.map(customers, (customer) => (
                  <CustomerCard
                    role={role}
                    key={customer.id}
                    customer={customer}
                    onSelect={this.onCustomerSelected}
                    getMenu={this.getMenu(customer)}
                    subscriptionsInUse={this.subscriptionsInUse}
                    subscriptionsUnAssigned={this.subscriptionsUnAssigned}
                  />
                ))}
              </div>
              {searchText &&
                this.props.getCustomers_flag &&
                !_.get(this.props, "customers.length") && (
                  <Row className="maindashboard__nodata">
                    <Icon
                      style={{ fontSize: "20px" }}
                      type="exclamation-circle"
                      className="maindashboard__nodata-icon"
                    />
                    {translate("error.dashboard.notfound", {
                      type: translate("label.dashboard.customers"),
                    })}
                  </Row>
                )}
            </React.Fragment>
          )}
          <DeactivateModal
            isActive={_.get(this.state, "selectedCustomer.is_active", false)}
            visible={this.state.showDeactivateModal}
            title={
              _.get(this.state, "selectedCustomer.is_active", false)
                ? `${translate("label.usermgmt.deactivateacc")}?`
                : `${translate("label.usermgmt.activateacc")}?`
            }
            content={
              _.get(this.state, "selectedCustomer.is_active", false)
                ? translate("text.customer.deactivate")
                : translate("text.customer.activate")
            }
            closeModal={this.closeActivateDeactivateModal}
            submit={this.activateDeactivate}
          />
          {(showSubscriptionsInUse || showLicenceUnAssigned) && (
            <LicenceInUseUnAssigned
              type={showSubscriptionsInUse ? "inuse" : "unassigned"}
              visible={showSubscriptionsInUse || showLicenceUnAssigned}
              closeModal={this.closeSubscriptionsModal}
              customer={this.state.selectedCustomer}
              onAssignLicenseClick={this.openUsersModal}
            />
          )}
          {showUsersModal && (
            <AssignLicenceWithUsers
              licence={this.state.assigningLicence}
              selectedUsers={this.state.selectedUsers}
              closeModal={this.closeUsersModal}
              onUserSelect={this.onUserSelect}
            />
          )}
          <AssignLicence
            visible={this.state.showAssignLicenceToUser}
            licence={this.state.assigningLicence}
            users={this.state.selectedUsers}
            closeModal={this.closeAssignLicenceToUserModal}
            back={this.goBackToUsersModal}
            submit={this.assignLicence}
          />
        </ContentLayout>
      </React.Fragment>
    );
  }
}

const TableColumnNames = {
  CHECKBOX: "",
  CUSTOMER_NAME: translate("label.dashboard.customername"),
  USERS: translate("label.dashboard.users"),
  APPLICATIONS: translate("label.dashboard.applications"),
  STORAGE: translate("label.dashboard.storage"),
  COMPANY_ADMIN: translate("label.dashboard.companyadmin"),
  SUBSCRIPTION: translate("label.dashboard.subscription"),
};

const TableColumns = [
  {
    name: TableColumnNames.CUSTOMER_NAME,
    key: "company_name",
    checkbox: false,
    sort: true,
    width: "25%",
  },
  {
    name: TableColumnNames.USERS,
    key: "number_of_users",
    checkbox: false,
    sort: true,
    width: "8%",
  },
  {
    name: TableColumnNames.APPLICATIONS,
    key: "number_of_submissions",
    checkbox: false,
    sort: true,
    width: "12%",
  },
  {
    name: TableColumnNames.STORAGE,
    key: "max_space",
    checkbox: false,
    sort: true,
    width: "13%",
  },
  {
    name: TableColumnNames.COMPANY_ADMIN,
    key: "admin_name",
    checkbox: false,
    sort: true,
    width: "20%",
  },
  {
    name: TableColumnNames.SUBSCRIPTION,
    checkbox: false,
    width: "22%",
  },
];

const getColumnWidth = _.memoize((name) => {
  const col = _.find(TableColumns, (col) => col.name === name);
  return _.get(col, "width");
});

const Column = styled.div`
  width: ${(props) => props.width};
`;

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    user: state.Login.user,
    customer: state.Login.customer,
    customers: state.Customer.customers,
    customerCount: state.Customer.customerCount,
    getCustomers_flag: state.Customer.getCustomers_flag,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...CustomerActions }, dispatch),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerDashboard);
