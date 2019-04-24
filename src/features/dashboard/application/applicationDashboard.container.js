import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import _ from "lodash";
import { Icon, Dropdown, Menu, Avatar } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SubmissionCard from "../submissionCard.component";
import { ApplicationActions } from "../../../redux/actions";
import Header from "../../header/header.component";
import styled from "styled-components";
import { DEBOUNCE_TIME } from "../../../constants";
import {
  isLoggedInOmniciaRole,
  isLoggedInCustomerAdmin,
  getFormattedDate,
  isLoggedInOmniciaAdmin
} from "../../../utils";
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
import { translate } from "../../../translations/translator";
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

  onMenuClick = submission => ({ key }) => {
    this.onMenuItemClick(key, submission);
  };

  getMenu = submission => () => {
    return (
      <Menu onClick={this.onMenuClick(submission)}>
        <Menu.Item disabled>
          <span className="submissioncard__heading-dropdown--item">
            Edit User Permissions
          </span>
        </Menu.Item>
        <Menu.Item disabled>
          <span className="submissioncard__heading-dropdown--item red-text">
            Remove Application
          </span>
        </Menu.Item>
        <Menu.Item key="window">
          <span className="submissioncard__heading-dropdown--item">
            Open in new Window
          </span>
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
      const newWindow = window.open(
        `${process.env.PUBLIC_URL}/submission`,
        "_blank",
        "height=0, width=0"
      );
      newWindow.addEventListener("load", function() {
        newWindow.document.title = submission.name;
      });
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
              placeholder={translate("text.header.search", {
                type: translate("label.dashboard.applications")
              })}
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
                {translate("label.dashboard.customers")}
              </span>
              <span style={{ margin: "0px 5px" }}>></span>
              <span
                className="maindashboard-breadcrum"
                style={{ opacity: 0.4, cursor: "not-allowed" }}
              >
                {translate("label.dashboard.applications")}
              </span>
            </div>
          )}
          <div className="maindashboard__header">
            <div className="global__center-vert">
              <span className="maindashboard__header-customers">
                {_.get(selectedCustomer, "company_name", "")}
              </span>
              {(isLoggedInOmniciaAdmin(this.props.role) ||
                isLoggedInCustomerAdmin(this.props.role)) && (
                <div
                  className="maindashboard__header__addEdit"
                  onClick={this.openUserManagement}
                >
                  {translate("label.usermgmt.title")}
                </div>
              )}
            </div>
            <OmniButton
              type="add"
              label={translate("label.button.add", {
                type: translate("label.dashboard.application")
              })}
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
                      {getFormattedDate(_.get(submission, "created_at"))}
                    </Column>
                    <Column
                      width={getColumnWidth(TableColumnNames.LAST_UPDATED)}
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {getFormattedDate(_.get(submission, "updated_at"))}
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
                        overlay={this.getMenu(submission)}
                        trigger={["click"]}
                        overlayClassName="maindashboard__list__item-dropdown"
                      >
                        <img
                          src="/images/overflow-black.svg"
                          style={{ width: "20px", height: "20px" }}
                        />
                      </Dropdown>
                    </Column>
                  </Row>
                ))}
              </div>
              {!_.get(submissions, "length") && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.notfound", {
                    type: translate("label.dashboard.applications")
                  })}
                </Row>
              )}
              <Pagination
                containerStyle={
                  submissionCount > 4
                    ? { marginTop: "1%" }
                    : { marginTop: "20%" }
                }
                total={submissionCount}
                showTotal={(total, range) =>
                  translate("text.pagination", {
                    top: range[0],
                    bottom: range[1],
                    total,
                    type: translate("label.dashboard.applications")
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
                {_.map(submissions, submission => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onSelect={this.onSubmissionSelected}
                    getMenu={this.getMenu(submission)}
                  />
                ))}
              </div>
              {!_.get(submissions, "length") && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.notfound", {
                    type: translate("label.dashboard.applications")
                  })}
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
  APPLICATION_NAME: translate("label.dashboard.applicationname"),
  SEQUENCES: translate("label.dashboard.sequences"),
  ADDEDBY: translate("label.dashboard.addedby"),
  ADDEDON: translate("label.dashboard.addedon"),
  LAST_UPDATED: translate("label.dashboard.lastupdated"),
  USERS: translate("label.dashboard.users")
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
