import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Header from "../header/header.component";
import {
  Loader,
  ContentLayout,
  Row,
  Text,
  SubHeader,
  TableHeader,
  Pagination,
} from "../../uikit/components";
import { Popover, Switch, Icon } from "antd";
import PopoverCustomers from "../usermanagement/popoverCustomers.component";
import { isLoggedInOmniciaAdmin } from "../../utils";
import { get, find, memoize, map, filter, every, set } from "lodash";
import { CustomerActions } from "../../redux/actions";
import styled from "styled-components";
import { translate } from "../../translations/translator";
import ApplicationErrorsModal from "../../uikit/components/modal/applicationErrorsModal.component";
class ValidateApplications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      itemsPerPage: 5,
      checkedApplications: [],
      selectedCustomer: this.props.selectedCustomer,
      selectedApplication: {},
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
          name: TableColumnNames.NOOFSEQUENCES,
          key: "expired_date",
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.ERRORS,
          key: "first_name",
          width: "20%",
        },
        {
          name: TableColumnNames.APPLICATIONSTATUS,
          key: "first_name",
          width: "20%",
          toggle: true,
          allViewable: false,
          onStatusClick: this.checkAll,
        },
      ],
      applications: [
        {
          id: 1,
          sequence_count: 5,
          uploaded_sequences: 2,
          errors: 2,
          isViewable: false,
          customer_name: "LOXO",
          name: "ind000001",
        },
        {
          id: 2,
          sequence_count: 5,
          uploaded_sequences: 1,
          errors: 0,
          isViewable: true,
          customer_name: "LOXO",
          name: "ind000002",
        },
        {
          id: 1,
          sequence_count: 5,
          uploaded_sequences: 3,
          errors: 0,
          isViewable: false,
          customer_name: "LOXO",
          name: "ind000003",
        },
      ],
    };
  }

  componentDidMount() {
    let selectedCustomer = {
      id: 0,
      company_name: "All Customers",
    };
    this.setState({ selectedCustomer });
  }

  /**
   * get each column width
   */
  getColumnWidth = memoize((name) => {
    const col = find(this.state.TableColumns, (col) => col.name === name);
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

  handleSwitchChange = (record) => {};

  /**
   *
   * @param {*} checked
   */
  checkAll = (checked, event) => {
    // Returing if there are no customers
    let isViewable = checked;
    if (!this.state.applications.length) {
      event.preventDefault();
      return;
    }
    let checkedApplications = [];
    let applications = this.state.applications.slice(
      0,
      this.state.itemsPerPage
    );
    // filtering applications without errors
    let withoutErrorApplications = filter(applications, (application) => {
      return application.errors == 0;
    });
    if (isViewable) {
      map(applications, (application) => {
        let viewable = application.errors == 0 ? true : false;
        set(application, "isViewable", viewable);
      });
      checkedApplications = [...withoutErrorApplications];
    } else {
      applications = map(applications, (application) => ({
        ...application,
        isViewable,
      }));
      checkedApplications.length = 0;
    }
    const TableColumns = [...this.state.TableColumns];
    TableColumns[4].allViewable = isViewable;
    applications = [...applications];
    this.setState({
      applications,
      TableColumns,
      checkedApplications,
    });
  };

  /**
   *
   * @param {*} application
   */
  onStatusClick = (application) => (checked) => {
    const TableColumns = [...this.state.TableColumns];
    let checkedApplications = [...this.state.checkedApplications];
    let applications = this.state.applications.slice(
      0,
      this.state.itemsPerPage
    );
    // filtering applications without errors
    let withoutErrorApplications = filter(applications, (application) => {
      return application.errors == 0;
    });
    application.isViewable = checked;
    // If customer is selected
    if (checked) {
      checkedApplications.push(application);
    } else {
      checkedApplications = filter(
        checkedApplications,
        (checkedApplication) => {
          return checkedApplication.id !== application.id;
        }
      );
    }
    //Checking if the emails not customers all are selected or not
    TableColumns[4].allViewable = every(withoutErrorApplications, [
      "isViewable",
      true,
    ]);
    this.setState({
      applications,
      TableColumns,
      checkedApplications,
    });
  };

  /**
   * open application errors modal
   * @param {*} application
   */
  openApplicationsErrorModal = (application) => {
    this.setState({
      selectedApplication: application,
      showApplicationErrorModal: true,
    });
  };

  /**
   * closing application errors modal
   */
  closeApplicationsErrorModal = () => {
    this.setState({ showApplicationErrorModal: false });
  };

  render() {
    const { loading } = this.props;
    const {
      applications,
      itemsPerPage,
      pageNo,
      TableColumns,
      selectedCustomer,
      selectedApplication,
      showApplicationErrorModal,
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
        <ContentLayout className="validate-applications-layout">
          <div className="validate-applications-layout__header">
            <Text
              type="bold"
              size="24px"
              textStyle={{ paddingLeft: "12px" }}
              text={translate("label.submissions.validateApplications")}
            />
          </div>

          <div className="validate-applications-layout__list">
            <TableHeader
              columns={TableColumns}
              sortColumn={this.sortColumn}
              checkAll={this.checkAll}
              viewAll={TableColumns[4].allViewable}
            />
            {map(applications, (application) => (
              <Row
                key={application.id}
                className="validate-applications-layout__list__item global__cursor-pointer"
                style={{ justifyContent: "normal" }}
              >
                <Column
                  width={this.getColumnWidth(TableColumnNames.CUSTOMER)}
                  className="validate-applications-layout__list__item-text"
                >
                  {get(application, "customer_name", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.APPLICATION)}
                  className="validate-applications-layout__list__item-text"
                >
                  {get(application, "name", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.NOOFSEQUENCES)}
                  className="validate-applications-layout__list__item-text"
                >
                  {`${get(application, "uploaded_sequences", 0)} of ${get(
                    application,
                    "sequence_count",
                    0
                  )}`}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.ERRORS)}
                  className="validate-applications-layout__list__item-text"
                >
                  <span
                    className={`${get(application, "errors") != 0 &&
                      "validate-applications-layout__list__item-text-link"}`}
                    onClick={application.errors != 0 ? e => this.openApplicationsErrorModal(application) : ''
                    }
                  >
                    {get(application, "errors", 0)}
                  </span>
                </Column>
                <Column
                  width={this.getColumnWidth(
                    TableColumnNames.APPLICATIONSTATUS
                  )}
                  className="validate-applications-layout__list__item-text-status"
                >
                  <Switch
                    size="small"
                    disabled={get(application, "errors") != 0}
                    className="validate-applications-layout__list__item-text"
                    checked={
                      get(application, "errors") == 0 && application.isViewable
                    }
                    onClick={this.onStatusClick(application)}
                  ></Switch>
                  <span
                    className="validate-applications-layout__list__item-text"
                    style={{ paddingLeft: "12px" }}
                  >
                    {application.isViewable ? "On" : "Off"}
                  </span>
                </Column>
              </Row>
            ))}
          </div>
          {/* {!get(this.props, "users.length") && (
              <Row className="validate-applications-layout__nodata">
                <Icon
                  style={{ fontSize: "20px" }}
                  type="exclamation-circle"
                  className="validate-applications-layout__nodata-icon"
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
          {showApplicationErrorModal && (
            <ApplicationErrorsModal
              closeModal={this.closeApplicationsErrorModal}
              application={selectedApplication}
            />
          )}
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
  NOOFSEQUENCES: translate("label.dashboard.noOfSequences"),
  ERRORS: translate("text.generic.errors"),
  APPLICATIONSTATUS: translate("label.dashboard.applicationStatus"),
};

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    selectedCustomer: state.Customer.selectedCustomer,
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
)(ValidateApplications);
