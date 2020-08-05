import React, { Component } from "react";
import { connect } from "react-redux";
import { CustomerActions } from "../../redux/actions";
import Header from "../header/header.component";
import {
  Loader,
  ContentLayout,
  Row,
  Text,
  SubHeader,
  TableHeader,
  Pagination,
  SelectField,
} from "../../uikit/components";
import { Popover, Switch, Dropdown, Menu } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import PopoverCustomers from "../usermanagement/popoverCustomers.component";
import { isLoggedInOmniciaAdmin, getFormattedDate, isToday } from "../../utils";
import { get, find, memoize, map, set } from "lodash";
import styled from "styled-components";
import { translate } from "../../translations/translator";

class ApplicationManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      itemsPerPage: 5,
      checkedSequences: [],
      selectedCustomer: this.props.selectedCustomer,
      //this.props.submissions, -TODO remove once integration is done
      submissions: [
        {
          broken_x_ref: 0,
          created_at: "2020-07-29T09:23:45.892Z",
          created_by: "Demo Demo",
          customer_id: 702,
          id: 1,
          key: 1,
          is_deleting: false,
          is_submission: 0,
          is_uploading: false,
          life_cycle_json_path: "88e16fd5-7673-5eb5-b304-caa609fb06ac",
          name: "ind000001",
          value: "ind000001",
          profile: null,
          sequence_count: 1,
          submission_center: "CBER",
          template_id: null,
          updated_at: "2020-07-29T09:24:55.510Z",
        },
        {
          broken_x_ref: 0,
          created_at: "2020-07-29T09:23:45.892Z",
          created_by: "Demo Demo",
          customer_id: 702,
          id: 2,
          key: 2,
          is_deleting: false,
          is_submission: 0,
          is_uploading: false,
          life_cycle_json_path: "88e16fd5-7673-5eb5-b304-caa609fb06ac",
          name: "ind000002",
          value: "ind000002",
          profile: null,
          sequence_count: 1,
          submission_center: "CBER",
          template_id: null,
          updated_at: "2020-07-29T09:24:55.510Z",
        },
        {
          broken_x_ref: 0,
          created_at: "2020-07-29T09:23:45.892Z",
          created_by: "Demo Demo",
          customer_id: 702,
          id: 758,
          key: 758,
          is_deleting: false,
          is_submission: 0,
          is_uploading: false,
          life_cycle_json_path: "88e16fd5-7673-5eb5-b304-caa609fb06ac",
          name: "ind001368",
          value: "ind001368",
          profile: null,
          sequence_count: 1,
          submission_center: "CBER",
          template_id: null,
          updated_at: "2020-07-29T09:24:55.510Z",
        },
      ],
      submissionCount: 3, //this.props.submissionCount, - TODO - will remove this in the next sprint once integration is done
      //this.props.sequences,
      sequences: [
        {
          hasAccess: 1,
          id: 1,
          key: 1,
          json_path: "011143d1-d3ab-5442-8406-07b2ba787fb9",
          name: "0001",
          value: "0001",
          relative_seq_name: "0002",
          submission_id: 758,
          submission_sub_type: null,
          submission_type: "original-application",
        },
        {
          hasAccess: 1,
          id: 2,
          key: 2,
          json_path: "011143d1-d3ab-5442-8406-07b2ba787fb9",
          name: "0002",
          value: "0002",
          relative_seq_name: "0003",
          submission_id: 758,
          submission_sub_type: null,
          submission_type: "original-application",
        },
        {
          hasAccess: 1,
          id: 3,
          key: 3,
          json_path: "011143d1-d3ab-5442-8406-07b2ba787fb9",
          name: "0003",
          value: "0003",
          relative_seq_name: "0004",
          submission_id: 758,
          submission_sub_type: null,
          submission_type: "original-application",
        },
      ],

      TableColumns: [
        {
          name: TableColumnNames.CUSTOMER,
          key: "type_name",
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.APPLICATION,
          key: "duration",
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.SEQUENCE,
          key: "expired_date",
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.WIP,
          key: "first_name",
          width: "15%",
        },
        {
          name: TableColumnNames.LASTUPDATED,
          key: "first_name",
          sort: true,
          width: "20%",
        },
        {
          name: "",
          key: "",
          width: "5%",
        },
      ],
      applications: [
        {
          id: 1,
          seq_name: "0001",
          errors: 0,
          isViewable: false,
          customer_name: "LOXO",
          name: "ind000001",
          created_at: "2020-08-03T05:46:40.407Z",
        },
        {
          id: 1,
          seq_name: "0002",
          errors: 2,
          isViewable: false,
          customer_name: "LOXO",
          name: "ind000001",
          created_at: "2020-06-22T17:33:11.645Z",
        },
        {
          id: 1,
          seq_name: "0003",
          errors: 0,
          isViewable: true,
          customer_name: "LOXO",
          name: "ind000001",
          created_at: "2020-06-22T17:33:11.645Z",
        },
      ],
    };
  }

  componentDidMount() {
    let selectedCustomer = {
      id: 0,
      company_name: "All Customers",
    };
    let { submissions, sequences } = this.state;
    submissions = map(submissions, (submission) => {
      submission.key = submission.id;
      submission.value = submission.name;
      return submission;
    });
    sequences = map(sequences, (seq) => {
      seq.key = seq.id;
      seq.value = seq.name;
      return seq;
    });
    this.setState({ selectedCustomer, submissions, sequences });
  }

  /**
   * get each column width
   */
  getColumnWidth = memoize((name) => {
    const col = find(this.state.TableColumns, (column) => column.name === name);
    return get(col, "width");
  });

  /**
   * On customer selection in the subheader
   * @param {*} customer
   */
  onCustomerSelected = (customer) => {
    this.setState({ selectedCustomer: customer });
    this.props.dispatch(CustomerActions.setSelectedCustomer(customer));
  };

  /**
   *
   * @param {*} sortBy
   * @param {*} orderBy
   */
  sortColumn = (sortBy, orderBy) => {};

  /**
   * Refresh sequence for the latest file changes
   * @param {*} seq
   */
  refreshSequence = (seq) => () => {};

  /**
   * Context menu options
   * @param {*} application
   */
  getMenu = (application) => () => {
    return (
      <Menu className="maindashboard__list__item-dropdown-menu">
        <Menu.Item
          className="maindashboard__list__item-dropdown-menu-item-refresh"
          style={{ borderBottom: "0 !important" }}
          onClick={this.refreshSequence(application)}
        >
          <p>
            <img src="/images/refresh-black.svg" />
            <span>{translate("label.submissions.refresh")}</span>
          </p>
        </Menu.Item>
      </Menu>
    );
  };

  /**
   * Fetching the applications
   */
  fetchApplications = () => {
    this.props.actions.resetApplications();
    this.setState({ submissions: [], openFailuresModal: false });
    const { selectedCustomer } = this.state;
    let searchText = "";
    selectedCustomer &&
      this.props.actions.fetchApplications(selectedCustomer.id, searchText);
  };

  /**
   * on changing the application
   * @param {*} value
   */
  onApplicationChange = (value) => {
    const optionObject = find(
      this.props.applications,
      (app) => app.key == value
    );
    this.setState({ application: { value, optionObject, error: "" } });
  };

  render() {
    const { loading } = this.props;
    const {
      applications,
      itemsPerPage,
      pageNo,
      TableColumns,
      selectedCustomer,
      submissions,
      sequences,
    } = this.state;
    let applicationsCount = 3;
    return (
      <>
        <Loader loading={loading} />
        <Header />
        <SubHeader>
          {isLoggedInOmniciaAdmin(this.props.role) && (
            <Popover
              trigger="click"
              placement="bottom"
              content={
                <PopoverCustomers
                  onCustomerSelected={this.onCustomerSelected}
                  showAll={true}
                />
              }
            >
              <Row style={{ margin: "auto" }}>
                <Text
                  type="extra_bold"
                  size="20px"
                  className="userManagement-subheader-title"
                  text={selectedCustomer.company_name}
                />
                <img
                  className="global__cursor-pointer"
                  src="/images/caret-inactive.svg"
                  style={{ marginLeft: "5px" }}
                />
              </Row>
            </Popover>
          )}
        </SubHeader>
        <ContentLayout className="applications-management-layout">
          <div className="applications-management-layout__header">
            <Text
              type="bold"
              size="24px"
              className="applications-management-layout__header-title"
              text={translate("label.submissions.applicationManagement")}
            />
            <div className="applications-management-layout__header__selectOptions">
              <SelectField
                className="applications-management-layout__header__selectOptions__field"
                selectFieldClassName="applications-management-layout__header__selectOptions__field-select"
                // selectedValue={selectedSequence.value}
                // error={selectedSequence.error}
                suffixIcon={<CaretDownOutlined />}
                options={sequences}
                style={{ marginRight: "0" }}
                label={translate("label.dashboard.sequence")}
                placeholder={translate("label.generic.all")}
              />
              <SelectField
                className="applications-management-layout__header__selectOptions__field"
                selectFieldClassName="applications-management-layout__header__selectOptions__field-select"
                // selectedValue={selectedApplication.value}
                // error={selectedApplication.error}
                suffixIcon={<CaretDownOutlined />}
                options={submissions}
                label={translate("label.dashboard.application")}
                placeholder={translate("label.generic.all")}
              />
            </div>
          </div>

          <div className="applications-management-layout__list">
            <TableHeader columns={TableColumns} sortColumn={this.sortColumn} />
            {map(applications, (application) => (
              <Row
                key={application.id}
                className="applications-management-layout__list__item"
                style={{ justifyContent: "normal" }}
              >
                <Column
                  width={this.getColumnWidth(TableColumnNames.CUSTOMER)}
                  className="applications-management-layout__list__item-text"
                >
                  {get(application, "customer_name", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.APPLICATION)}
                  className="applications-management-layout__list__item-text"
                >
                  {get(application, "name", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.SEQUENCE)}
                  className="applications-management-layout__list__item-text"
                >
                  {get(application, "seq_name", "N/A")}
                </Column>

                <Column
                  width={this.getColumnWidth(TableColumnNames.WIP)}
                  className="applications-management-layout__list__item-text-status"
                >
                  <Switch
                    size="small"
                    className="applications-management-layout__list__item-text global__cursor-pointer"
                  ></Switch>
                  <span
                    className="applications-management-layout__list__item-text"
                    style={{ paddingLeft: "12px" }}
                  >
                    {application.isViewable ? "Yes" : "No"}
                  </span>
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.LASTUPDATED)}
                  className="applications-management-layout__list__item-text"
                >
                  <span
                    className={`${isToday(application.created_at) &&
                      "applications-management-layout__list__item-text-link"}`}
                  >
                    {isToday(application.created_at)
                      ? "Today"
                      : getFormattedDate(application.created_at)}
                  </span>
                </Column>
                <Column>
                  <Dropdown
                    overlay={this.getMenu(application)}
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
          {/* {!get(this.props, "users.length") && (
              <Row className="applications-management-layout__nodata">
                <Icon
                  style={{ fontSize: "20px" }}
                  type="exclamation-circle"
                  className="applications-management-layout__nodata-icon"
                />
                {translate("error.dashboard.notfound", {
                  type: translate("label.dashboard.applications"),
                })}
              </Row>
            )} */}
          <Pagination
            key={applicationsCount}
            containerStyle={
              applicationsCount > 4 ? { marginTop: "1%" } : { marginTop: "20%" }
            }
            total={applicationsCount}
            showTotal={(total, range) =>
              translate("text.pagination", {
                top: range[0],
                bottom: range[1],
                total,
                type: translate("label.dashboard.applications"),
              })
            }
            pageSize={itemsPerPage}
            current={pageNo}
            onPageChange={this.onPageChange}
            onPageSizeChange={this.onPageSizeChange}
          />
        </ContentLayout>
      </>
    );
  }
}

const Column = styled.div`
  width: ${(props) => props.width};
`;

const TableColumnNames = {
  CUSTOMER: translate("label.dashboard.customer"),
  APPLICATION: translate("label.dashboard.application"),
  SEQUENCE: translate("label.dashboard.sequence"),
  WIP: translate("label.generic.wip"),
  LASTUPDATED: translate("label.generic.lastUpdated"),
};

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    selectedCustomer: state.Customer.selectedCustomer,
    selectedSubmission: state.Application.selectedSubmission,
    submissions: state.Application.submissions, //getSubmissionsByCustomer(state),
    submissionCount: state.Application.submissionCount,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationManagement);
