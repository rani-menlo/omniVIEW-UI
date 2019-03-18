import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import _ from "lodash";
import { Icon, Input, Checkbox, Dropdown, Menu, Avatar } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SubmissionCard from "../submissionCard.component";
import { ApplicationActions } from "../../../redux/actions";
import Loader from "../../../uikit/components/loader";
import Header from "../../header/header.component";
import Footer from "../../../uikit/components/footer/footer.component";
import TableHeader from "../../../uikit/components/table/tableHeader.component";
import Row from "../../../uikit/components/row/row.component";
import Pagination from "../../../uikit/components/pagination";
import styled from "styled-components";
import moment from "moment";
import { DATE_FORMAT } from "../../../constants";
import { isLoggedInOmniciaRole } from "../../../utils";
import PaginationCheckbox from "../../../uikit/components/pagination/paginationCheckbox.component";
// import { Customers } from "./sampleCustomers";

class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards",
      pageNo: 1,
      itemsPerPage: 5,
      searchText: ""
    };
    this.searchApplications = _.debounce(this.searchApplications, 700);
  }

  componentDidMount() {
    this.fetchApplications();
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

  fetchApplications = (sortBy = "name", orderBy = "ASC") => {
    const { viewBy, pageNo, itemsPerPage, searchText } = this.state;
    const { selectedCustomer } = this.props;
    if (viewBy === "lists") {
      selectedCustomer &&
        this.props.actions.fetchApplicationsByList(
          selectedCustomer.id,
          pageNo,
          itemsPerPage,
          sortBy,
          orderBy,
          searchText || ""
        );
    } else {
      selectedCustomer &&
        this.props.actions.fetchApplications(
          selectedCustomer.id,
          searchText || ""
        );
    }
  };

  changeView = type => () => {
    this.setState({ viewBy: type }, () => this.fetchApplications());
  };

  onSubmissionSelected = submission => () => {
    this.props.actions.setSelectedSubmission(submission);
    this.props.history.push("/submission");
  };

  openCustomersScreen = () => {
    this.props.history.goBack();
  };

  onPageChange = pageNo => {
    this.setState({ pageNo }, () => this.fetchApplications());
  };

  onPageSizeChange = itemsPerPage => {
    this.setState({ itemsPerPage }, () => this.fetchApplications());
  };

  sortColumn = (sortBy, orderBy) => {
    this.fetchApplications(sortBy, orderBy);
  };

  handleSearch = e => {
    const searchText = e.target.value;
    this.setState({ searchText });
    if (searchText === "" || _.size(searchText) >= 3) {
      this.searchApplications();
    }
  };

  searchApplications = () => {
    this.fetchApplications();
  };

  clearSearch = () => {
    this.setState({ searchText: "" });
    this.searchApplications();
  };

  render() {
    const { viewBy, searchText } = this.state;
    const {
      submissions,
      loading,
      selectedCustomer,
      submissionCount
    } = this.props;
    if (!selectedCustomer) {
      return <Redirect to="/customers" />;
    }
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
                placeholder="Search Applications..."
                onChange={this.handleSearch}
              />
            </div>
          </div>
          <div className="maindashboard__content">
            {isLoggedInOmniciaRole(this.props.role) && (
              <div>
                <span
                  className="maindashboard__content-breadcrum"
                  onClick={this.openCustomersScreen}
                >
                  Customers
                </span>
                <span style={{ margin: "0px 5px" }}>></span>
                <span
                  className="maindashboard__content-breadcrum"
                  style={{ opacity: 0.4, cursor: "not-allowed" }}
                >
                  Applications
                </span>
              </div>
            )}
            <div className="maindashboard__content__header">
              <div>
                <span className="maindashboard__content__header-customers">
                  {_.get(selectedCustomer, "company_name", "")}
                </span>
                <div
                  className="maindashboard__content__header__addEdit"
                  style={{ opacity: 0.2, cursor: "not-allowed" }}
                >
                  Add/Edit Users
                </div>
              </div>
              <span className="maindashboard__content__header-addcustomer global__disabled-box">
                <img src="/images/plus.svg" />
                <span className="maindashboard__content__header-addcustomer--text">
                  Add New Application{" "}
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
                  {_.map(submissions, submission => (
                    <Row
                      key={submission.id}
                      className="maindashboard__content__list__item"
                    >
                      <Column width={getColumnWidth(TableColumnNames.CHECKBOX)}>
                        <PaginationCheckbox />
                      </Column>
                      <Column
                        width={getColumnWidth(
                          TableColumnNames.APPLICATION_NAME
                        )}
                        className="maindashboard__content__list__item-text-bold"
                        onClick={this.onSubmissionSelected(submission)}
                      >
                        {_.get(submission, "name", "")}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.SEQUENCES)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onSubmissionSelected(submission)}
                      >
                        {_.get(submission, "sequence_count", "")}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.ADDEDBY)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onSubmissionSelected(submission)}
                      >
                        <Avatar
                          size="small"
                          icon="user"
                          style={{ marginRight: "10px" }}
                        />
                        {_.get(submission, "created_by") || "Corabelle Durrad"}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.ADDEDON)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onSubmissionSelected(submission)}
                      >
                        {moment(_.get(submission, "created_at", "")).format(
                          DATE_FORMAT
                        )}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.LAST_UPDATED)}
                        className="maindashboard__content__list__item-text"
                        onClick={this.onSubmissionSelected(submission)}
                      >
                        {moment(_.get(submission, "updated_at", "")).format(
                          DATE_FORMAT
                        )}
                      </Column>
                      <Column
                        width={getColumnWidth(TableColumnNames.USERS)}
                        className="maindashboard__content__list__item__row maindashboard__content__list__item-text"
                      >
                        <div>
                          <Avatar size="small" icon="user" />
                          <Avatar size="small" icon="user" />
                          <Avatar size="small" icon="user" />
                          <Avatar size="small" icon="user" />
                        </div>
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
                {searchText && !_.get(submissions, "length") && (
                  <Row className="maindashboard__content__nodata">
                    <Icon
                      style={{ fontSize: "20px" }}
                      type="exclamation-circle"
                      className="maindashboard__content__nodata-icon"
                    />
                    No Applications found
                  </Row>
                )}
                <Pagination
                  containerStyle={
                    submissionCount > 4
                      ? { marginTop: "5%" }
                      : { marginTop: "20%" }
                  }
                  total={submissionCount}
                  showTotal={(total, range) =>
                    `Showing - ${range[0]}-${range[1]} of ${total} Applications`
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
                  {_.map(submissions, submission => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      onSelect={this.onSubmissionSelected}
                    />
                  ))}
                </div>
                {searchText && !_.get(submissions, "length") && (
                  <Row className="maindashboard__content__nodata">
                    <Icon
                      style={{ fontSize: "20px" }}
                      type="exclamation-circle"
                      className="maindashboard__content__nodata-icon"
                    />
                    No Applications found
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
  APPLICATION_NAME: "Application Name",
  SEQUENCES: "Sequences",
  ADDEDBY: "Added By",
  ADDEDON: "Added On",
  LAST_UPDATED: "Last Updated",
  USERS: "Users"
};

const TableColumns = [
  {
    name: TableColumnNames.CHECKBOX,
    checkbox: true,
    sort: false,
    width: "5%"
  },
  {
    name: TableColumnNames.APPLICATION_NAME,
    key: "name",
    checkbox: false,
    sort: true,
    width: "22%"
  },
  {
    name: TableColumnNames.SEQUENCES,
    key: "sequence_count",
    checkbox: false,
    sort: true,
    width: "12%"
  },
  {
    name: TableColumnNames.ADDEDBY,
    key: "created_by",
    checkbox: false,
    sort: true,
    width: "20%",
    style: { justifyContent: "center" }
  },
  {
    name: TableColumnNames.ADDEDON,
    key: "created_at",
    checkbox: false,
    sort: true,
    width: "12%"
  },
  {
    name: TableColumnNames.LAST_UPDATED,
    key: "updated_at",
    checkbox: false,
    sort: true,
    width: "15%"
  },
  {
    name: TableColumnNames.USERS,
    checkbox: false,
    width: "24%"
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
    submissions: state.Application.submissions, //getSubmissionsByCustomer(state),
    selectedCustomer: state.Customer.selectedCustomer,
    submissionCount: state.Application.submissionCount
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...ApplicationActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationDashboard);
