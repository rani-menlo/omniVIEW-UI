import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import _ from "lodash";
import { Icon, Input, Checkbox, Dropdown, Menu, Avatar } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SubmissionCard from "../submissionCard.component";
import { ApplicationActions } from "../../../redux/actions";
import Header from "../../header/header.component";
import styled from "styled-components";
import moment from "moment";
import { DATE_FORMAT, DEBOUNCE_TIME } from "../../../constants";
import { isLoggedInOmniciaRole, isLoggedInCustomerAdmin } from "../../../utils";
import {
  Loader,
  Footer,
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
    this.searchApplications = _.debounce(
      this.searchApplications,
      DEBOUNCE_TIME
    );
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

  changeView = type => {
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

  openUserManagement = () => {
    this.props.history.push("/usermanagement");
  };

  onMenuItemClick = (key, submission) => {
    if (key === "window") {
      this.props.actions.setSelectedSubmission(submission);
      window.open(
        `${process.env.PUBLIC_URL}/submission`,
        "_blank",
        "height=0, width=0"
      );
    }
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
              placeholder="Search Applications..."
              searchText={searchText}
              clearSearch={this.clearSearch}
              onChange={this.handleSearch}
            />
          </div>
        </SubHeader>
        <ContentLayout className="maindashboard">
          {isLoggedInOmniciaRole(this.props.role) && (
            <div>
              <span
                className="maindashboard-breadcrum"
                onClick={this.openCustomersScreen}
              >
                Customers
              </span>
              <span style={{ margin: "0px 5px" }}>></span>
              <span
                className="maindashboard-breadcrum"
                style={{ opacity: 0.4, cursor: "not-allowed" }}
              >
                Applications
              </span>
            </div>
          )}
          <div className="maindashboard__header">
            <div className="global__center-vert">
              <span className="maindashboard__header-customers">
                {_.get(selectedCustomer, "company_name", "")}
              </span>
              {(isLoggedInCustomerAdmin(this.props.role) ||
                selectedCustomer.is_omnicia) && (
                <div
                  className="maindashboard__header__addEdit"
                  onClick={this.openUserManagement}
                >
                  User Management
                </div>
              )}
            </div>
            <OmniButton
              type="add"
              label="Add New Application"
              className="global__disabled-box"
            />
          </div>
          {viewBy === "lists" && (
            <React.Fragment>
              <div className="maindashboard__list">
                <TableHeader
                  columns={TableColumns}
                  sortColumn={this.sortColumn}
                />
                {_.map(submissions, submission => (
                  <Row
                    key={submission.id}
                    className="maindashboard__list__item"
                  >
                    <Column width={getColumnWidth(TableColumnNames.CHECKBOX)}>
                      <PaginationCheckbox />
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.APPLICATION_NAME)}
                      className="maindashboard__list__item-text-bold"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {_.get(submission, "name", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.SEQUENCES)}
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {_.get(submission, "sequence_count", "")}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.ADDEDBY)}
                      className="maindashboard__list__item-text"
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
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {moment(_.get(submission, "created_at", "")).format(
                        DATE_FORMAT
                      )}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.LAST_UPDATED)}
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {moment(_.get(submission, "updated_at", "")).format(
                        DATE_FORMAT
                      )}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.USERS)}
                      className="maindashboard__list__item__row maindashboard__list__item-text"
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
                        overlayClassName="maindashboard__list__item-dropdown"
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
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
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
              <div className="maindashboard__cards">
                {_.map(submissions, submission => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onSelect={this.onSubmissionSelected}
                    onMenuItemClick={this.onMenuItemClick}
                  />
                ))}
              </div>
              {searchText && !_.get(submissions, "length") && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  No Applications found
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
