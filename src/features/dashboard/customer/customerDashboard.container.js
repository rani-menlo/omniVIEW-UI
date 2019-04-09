import React, { Component } from "react";
import _ from "lodash";
import { Icon, Dropdown, Menu } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import CustomerCard from "../customerCard.component";
import { CustomerActions } from "../../../redux/actions";
import Header from "../../header/header.component";
import { isLoggedInOmniciaRole } from "../../../utils";
import {
  Loader,
  TableHeader,
  Row,
  Pagination,
  PaginationCheckbox,
  OmniButton,
  SearchBox,
  ListViewGridView,
  SubHeader,
  ContentLayout
} from "../../../uikit/components";
import { DEBOUNCE_TIME } from "../../../constants";
import { translate } from "../../../translations/translator";

class CustomerDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards",
      pageNo: 1,
      itemsPerPage: 5,
      searchText: ""
    };
    this.searchCustomers = _.debounce(this.searchCustomers, DEBOUNCE_TIME);
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

  changeView = type => {
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

  addCustomer = () => {
    this.props.history.push("/usermanagement/customer/add");
  };

  render() {
    const { viewBy, searchText } = this.state;
    const { customers, loading, customerCount } = this.props;
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
                type: translate("label.dashboard.customers")
              })}
              searchText={searchText}
              clearSearch={this.clearSearch}
              onChange={this.handleSearch}
            />
          </div>
        </SubHeader>
        <ContentLayout className="maindashboard">
          <div className="maindashboard__header">
            <div>
              <span className="maindashboard__header-customers">
                {translate("label.dashboard.customers")}
              </span>
            </div>
            <OmniButton
              type="add"
              label={translate("label.button.add", {
                type: translate("label.dashboard.customer")
              })}
              onClick={this.addCustomer}
              // className="global__disabled-box"
            />
          </div>
          {viewBy === "lists" && (
            <React.Fragment>
              <div className="maindashboard__list">
                <TableHeader
                  columns={TableColumns}
                  sortColumn={this.sortColumn}
                />
                {_.map(customers, customer => (
                  <Row key={customer.id} className="maindashboard__list__item">
                    <Column width={getColumnWidth(TableColumnNames.CHECKBOX)}>
                      <PaginationCheckbox />
                    </Column>
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
                      {_.get(
                        customer,
                        "subscription",
                        "12 in use  | 3 unassigned"
                      )}
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
                    type: translate("label.dashboard.customers")
                  })}
                </Row>
              )}
              <Pagination
                containerStyle={
                  customerCount > 4 ? { marginTop: "5%" } : { marginTop: "20%" }
                }
                total={customerCount}
                showTotal={(total, range) =>
                  translate("text.pagination", {
                    top: range[0],
                    bottom: range[1],
                    total,
                    type: translate("label.dashboard.customers")
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
                {_.map(customers, customer => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onSelect={this.onCustomerSelected}
                  />
                ))}
              </div>
              {searchText && !customers.length && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.customers.notfound")}
                </Row>
              )}
            </React.Fragment>
          )}
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
  SUBSCRIPTION: translate("label.dashboard.subscription")
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
