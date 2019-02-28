import React, { Component } from "react";
import _ from "lodash";
import { Icon, Input, Checkbox, Dropdown, Menu } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import CustomerCard from "../customerCard.component";
import { CustomerActions } from "../../../redux/actions";
import Header from "../../header/header.component";
import Loader from "../../../uikit/components/loader";
import Footer from "../../../uikit/components/footer/footer.component";
import TableHeader from "../../../uikit/components/table/tableHeader.component";
import Row from "../../../uikit/components/row/row.component";
import Pagination from "../../../uikit/components/pagination";
import { Redirect } from "react-router-dom";
import { isLoggedInOmniciaRole } from "../../../utils";

class CustomerDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards",
      pageNo: 1,
      itemsPerPage: 5,
      searchText: ""
    };
    this.searchCustomers = _.debounce(this.searchCustomers, 700);
  }

  componentDidMount() {
    if (isLoggedInOmniciaRole(this.props.role)) {
      this.fetchCustomers();
    } else {
      const { user } = this.props;
      this.onCustomerSelected({ id: user.customer_id })();
    }
  }

  fetchCustomers = (sortBy = "company_name", orderBy = "ASC") => {
    const { viewBy, pageNo, itemsPerPage, searchText } = this.state;
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

  changeView = type => () => {
    this.setState({ viewBy: type }, () => this.fetchCustomers());
  };

  onCustomerSelected = customer => () => {
    this.props.actions.setSelectedCustomer(customer);
    this.props.history.push("/applications");
  };

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

  onPageChange = pageNo => {
    this.setState({ pageNo }, () => this.fetchCustomers());
  };

  onPageSizeChange = itemsPerPage => {
    this.setState({ itemsPerPage }, () => this.fetchCustomers());
  };

  sortColumn = (sortBy, orderBy) => {
    this.fetchCustomers(sortBy, orderBy);
  };

  handleSearch = e => {
    const searchText = e.target.value;
    this.setState({ searchText });
    if (searchText === "" || _.size(searchText) >= 3) {
      this.searchCustomers();
    }
  };

  searchCustomers = () => {
    this.fetchCustomers();
  };

  clearSearch = () => {
    this.setState({ searchText: "" });
    this.searchCustomers();
  };

  render() {
    const { viewBy, searchText } = this.state;
    const { customers, loading, customerCount } = this.props;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header />
        <div className="maindashboard">
          <div className="maindashboard__header">
            <div
              className={`maindashboard__header__icon maindashboard__header__icon-cards ${viewBy ===
                "cards" && "maindashboard__header__icon-selected"}`}
              onClick={this.changeView("cards")}
            >
              <Icon
                type="appstore"
                theme="filled"
                className={`card-icon ${viewBy === "cards" &&
                  "card-icon-colored"}`}
              />
            </div>
            <div
              className={`maindashboard__header__icon maindashboard__header__icon-lists ${viewBy ===
                "lists" && "maindashboard__header__icon-selected"}`}
              onClick={this.changeView("lists")}
            >
              <img
                src={
                  viewBy === "lists"
                    ? "/images/list-view-active.svg"
                    : "/images/list-view.svg"
                }
              />
            </div>
            {/* <div className="maindashboard__header__icon maindashboard__header__icon-filter">
              <img src={FilterIcon} />
            </div>
            <span className="maindashboard__header-filter-text">
              Filters: Off
            </span> */}
            <div className="maindashboard__header__search">
              <Input
                value={searchText}
                className="maindashboard__header__search-box"
                prefix={
                  <img src="/images/search.svg" style={{ marginLeft: "5px" }} />
                }
                suffix={
                  searchText ? (
                    <img
                      src="/images/close.svg"
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer"
                      }}
                      onClick={this.clearSearch}
                    />
                  ) : (
                    ""
                  )
                }
                placeholder="Search Customers..."
                onChange={this.handleSearch}
              />
            </div>
          </div>
          <div className="maindashboard__content">
            <div className="maindashboard__content__header">
              <span className="maindashboard__content__header-customers">
                Customers ({customerCount})
              </span>
              <span className="maindashboard__content__header-addcustomer global__disabled-box">
                <img src="/images/plus.svg" />
                <span className="maindashboard__content__header-addcustomer--text">
                  Add New Customer{" "}
                </span>
              </span>
            </div>
            {viewBy === "lists" && (
              <React.Fragment>
                <div className="maindashboard__content__list">
                  <TableHeader
                    columns={TableColumns}
                    sortColumn={this.sortColumn}
                  />
                  {_.map(customers, customer => (
                    <Row
                      key={customer.id}
                      className="maindashboard__content__list__item"
                    >
                      <Column width={getColumnWidth(TableColumnNames.CHECKBOX)}>
                        <Checkbox />
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.CUSTOMER_NAME)}
                        className="maindashboard__content__list__item-text-bold"
                        onClick={this.onCustomerSelected(customer)}
                      >
                        {_.get(customer, "company_name", "")}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.USERS)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onCustomerSelected(customer)}
                      >
                        {_.get(customer, "number_of_users", "")}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.APPLICATIONS)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onCustomerSelected(customer)}
                      >
                        {_.get(customer, "number_of_submissions", "")}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.STORAGE)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onCustomerSelected(customer)}
                      >
                        {_.get(customer, "max_space") || "0"} TB
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.COMPANY_ADMIN)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onCustomerSelected(customer)}
                      >
                        {_.get(customer, "admin_name", "")}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.SUBSCRIPTION)}
                        className="maindashboard__content__list__item__row maindashboard__content__list__item-text"
                      >
                        {_.get(
                          customer,
                          "subscription",
                          "11 in use  | 3 unassigned"
                        )}
                        <Dropdown
                          overlay={this.getMenu()}
                          trigger={["click"]}
                          overlayClassName="maindashboard__content__list__item-dropdown"
                        >
                          <img
                            src="/images/overflow-blue.svg"
                            style={{ width: "20px", height: "20px" }}
                          />
                        </Dropdown>
                      </Column>
                    </Row>
                  ))}
                </div>
                {searchText && !customers.length && (
                  <Row className="maindashboard__content__nodata">
                    <Icon
                      style={{ fontSize: "20px" }}
                      type="exclamation-circle"
                      className="maindashboard__content__nodata-icon"
                    />
                    No Customers found
                  </Row>
                )}
                <Pagination
                  containerStyle={
                    customerCount > 4
                      ? { marginTop: "5%" }
                      : { marginTop: "20%" }
                  }
                  total={customerCount}
                  showTotal={(total, range) =>
                    `Showing - ${range[0]}-${range[1]} of ${total} Customers`
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
                <div className="maindashboard__content__cards">
                  {_.map(customers, customer => (
                    <CustomerCard
                      key={customer.id}
                      customer={customer}
                      onSelect={this.onCustomerSelected}
                    />
                  ))}
                </div>
                {searchText && !customers.length && (
                  <Row className="maindashboard__content__nodata">
                    <Icon
                      style={{ fontSize: "20px" }}
                      type="exclamation-circle"
                      className="maindashboard__content__nodata-icon"
                    />
                    No Customers found
                  </Row>
                )}
              </React.Fragment>
            )}
          </div>
          <Footer />
        </div>
      </React.Fragment>
    );
  }
}

const TableColumnNames = {
  CHECKBOX: "",
  CUSTOMER_NAME: "Customer Name",
  USERS: "Users",
  APPLICATIONS: "Applications",
  STORAGE: "Storage",
  COMPANY_ADMIN: "Company Admin",
  SUBSCRIPTION: "Subscription Licences"
};

const TableColumns = [
  {
    name: TableColumnNames.CHECKBOX,
    checkbox: true,
    sort: false,
    width: "5%"
  },
  {
    name: TableColumnNames.CUSTOMER_NAME,
    key: "company_name",
    checkbox: false,
    sort: true,
    width: "25%"
  },
  {
    name: TableColumnNames.USERS,
    key: "number_of_users",
    checkbox: false,
    sort: true,
    width: "8%"
  },
  {
    name: TableColumnNames.APPLICATIONS,
    key: "number_of_submissions",
    checkbox: false,
    sort: true,
    width: "12%"
  },
  {
    name: TableColumnNames.STORAGE,
    key: "max_space",
    checkbox: false,
    sort: true,
    width: "10%"
  },
  {
    name: TableColumnNames.COMPANY_ADMIN,
    key: "admin_name",
    checkbox: false,
    sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.SUBSCRIPTION,
    checkbox: false,
    width: "20%"
  }
];

const getColumnWidth = _.memoize(name => {
  const col = _.find(TableColumns, col => col.name === name);
  return _.get(col, "width");
});

const Column = styled.div`
  width: ${props => props.width};
`;

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    user: state.Login.user,
    customers: state.Customer.customers,
    customerCount: state.Customer.customerCount
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...CustomerActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerDashboard);
