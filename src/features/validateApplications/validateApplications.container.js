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
  Toast,
} from "../../uikit/components";
import {
  UPLOAD_FAILED,
  SCRIPT_ERROR,
  MISMATCH_SEQUENCES,
} from "../../constants";
import { Popover, Switch, Icon, Modal } from "antd";
import PopoverCustomers from "../usermanagement/popoverCustomers.component";
import { isLoggedInOmniciaAdmin } from "../../utils";
import { get, find, memoize, map, filter, every, set, isNull } from "lodash";
import {
  CustomerActions,
  ApplicationActions,
  ApiActions,
} from "../../redux/actions";
import styled from "styled-components";
import { translate } from "../../translations/translator";
import ApplicationErrorsModal from "../../uikit/components/modal/applicationErrorsModal.component";
import { ApplicationApi } from "../../redux/api";
class ValidateApplications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      limit: 5,
      checkedApplications: [],
      selectedErrors: [],
      selectedUploadedCustomer: this.props.selectedUploadedCustomer,
      selectedApplication: {},
      reportData: [],
      TableColumns: [
        {
          name: TableColumnNames.CUSTOMER,
          key: 1,
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.APPLICATION,
          key: 2,
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.NOOFSEQUENCES,
          key: 3,
          sort: true,
          width: "20%",
        },
        {
          name: TableColumnNames.ERRORS,
          key: 4,
          width: "20%",
        },
        {
          name: TableColumnNames.APPLICATIONSTATUS,
          key: 5,
          width: "20%",
          toggle: true,
          allViewable: false,
          onStatusClick: this.checkAll,
        },
      ],
      bulkUploadedSubmissions: [],
    };
  }

  /**
   * Fetching applications for the selected customer
   * @param {*} sortBy
   * @param {*} orderBy
   */
  fetchingBulkuploadedApplications = (sortByColumnId = 1, orderBy = "ASC") => {
    this.props.dispatch(ApplicationActions.resetbulkUploadedSubmissions());
    this.setState({ bulkUploadedSubmissions: [] });
    const {
      pageNo,
      limit,
      selectedUploadedCustomer,
      TableColumns,
    } = this.state;
    let postObj = {
      limit: Number(limit),
      page: Number(pageNo),
      order: orderBy,
      sortByColumnId: Number(sortByColumnId),
      customerId: Number(get(selectedUploadedCustomer, "id", 0)),
    };
    selectedUploadedCustomer &&
      this.props.dispatch(
        ApplicationActions.fetchBulkUploadedApplications(postObj, () => {
          TableColumns[4].allViewable = this.props.bulkUploadedSubmissions
            .length
            ? every(this.props.bulkUploadedSubmissions, [
                "applicationStatus",
                true,
              ])
            : false;
          this.setState({ TableColumns });
        })
      );
  };

  static getDerivedStateFromProps(props, state) {
    if (
      get(props, "bulkUploadedSubmissions.length") &&
      !get(state, "bulkUploadedSubmissions.length")
    ) {
      return {
        bulkUploadedSubmissions: [...props.bulkUploadedSubmissions],
      };
    }
    return null;
  }

  componentDidMount() {
    let { selectedUploadedCustomer } = this.state;
    if (isNull(selectedUploadedCustomer)) {
      selectedUploadedCustomer = {
        id: 0,
        company_name: "All Customers",
      };
    }
    this.onCustomerSelected(selectedUploadedCustomer);
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
    this.setState({ selectedUploadedCustomer: customer }, () => {
      this.props.dispatch(
        CustomerActions.setBulkUploadedSelectedCustomer(customer, () => {
          this.fetchingBulkuploadedApplications();
        })
      );
    });
  };

  /**
   * On changing the page in the list view
   * @param {*} pageNo
   */
  onPageChange = (pageNo) => {
    this.setState({ pageNo }, () => this.fetchingBulkuploadedApplications());
  };
  /**
   * On changing the size of the records per the page to display
   * @param {*} limit
   */
  onPageSizeChange = (limit) => {
    this.setState({ limit }, () => this.fetchingBulkuploadedApplications());
  };

  /**
   *
   * @param {*} sortBy
   * @param {*} orderBy
   */
  sortColumn = (sortBy, orderBy) => {
    this.fetchingBulkuploadedApplications(sortBy, orderBy);
  };

  /**
   * selected applications to toggle either to view the application or not when customer login to account
   * @param {*} selectedApplications
   */
  changeApplicationStatus = async (selectedApplications, status) => {
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await ApplicationApi.changeAppStatus({
      submissionIds:
        selectedApplications.length > 0
          ? map(selectedApplications, "submissionId")
          : [],
      status: status ? 1 : 0,
    });
    if (!res.data.error) {
      this.props.dispatch(ApiActions.successOnDemand());
      this.fetchingBulkuploadedApplications();
    } else {
      Toast.error(res.data.message);
      this.props.dispatch(ApiActions.successOnDemand());
    }
  };

  /**
   *
   * @param {*} checked
   */
  checkAll = (checked, event) => {
    // Returing if there are no customers
    let applicationStatus = checked;
    if (!this.state.bulkUploadedSubmissions.length) {
      event.preventDefault();
      return;
    }
    let checkedApplications = [];
    let bulkUploadedSubmissions = this.state.bulkUploadedSubmissions.slice(
      0,
      this.state.limit
    );
    // filtering applications without errors
    let withoutErrorApplications = filter(
      bulkUploadedSubmissions,
      (application) => {
        return application.errorCount == 0;
      }
    );
    if (applicationStatus) {
      map(bulkUploadedSubmissions, (application) => {
        let applicationStatus = application.errorCount == 0 ? true : false;
        set(application, "applicationStatus", applicationStatus);
      });
      checkedApplications = [...withoutErrorApplications];
    } else {
      bulkUploadedSubmissions = map(bulkUploadedSubmissions, (application) => ({
        ...application,
        applicationStatus,
      }));
      checkedApplications.length = 0;
    }
    const TableColumns = [...this.state.TableColumns];
    TableColumns[4].allViewable = applicationStatus;
    bulkUploadedSubmissions = [...bulkUploadedSubmissions];
    this.setState(
      {
        bulkUploadedSubmissions,
        TableColumns,
        checkedApplications,
      },
      () => {
        let unselectedApps = checked
          ? checkedApplications
          : withoutErrorApplications;
        this.changeApplicationStatus(unselectedApps, checked);
      }
    );
  };

  /**
   *
   * @param {*} application
   */
  onStatusClick = (application) => (checked) => {
    let uncheckedApplications = [];
    const TableColumns = [...this.state.TableColumns];
    let checkedApplications = [...this.state.checkedApplications];
    let bulkUploadedSubmissions = this.state.bulkUploadedSubmissions.slice(
      0,
      this.state.limit
    );
    // filtering applications without errors
    let withoutErrorApplications = filter(
      bulkUploadedSubmissions,
      (application) => {
        return application.errorCount == 0;
      }
    );
    application.applicationStatus = checked;
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
      uncheckedApplications.push(application);
    }
    //Checking if the applications without errors all are selected or not
    TableColumns[4].allViewable = every(withoutErrorApplications, [
      "applicationStatus",
      true,
    ]);
    this.setState(
      {
        bulkUploadedSubmissions,
        TableColumns,
        checkedApplications,
      },
      () => {
        let selectedaApp = checked
          ? checkedApplications
          : uncheckedApplications;
        this.changeApplicationStatus(selectedaApp, checked);
      }
    );
  };

  /**
   * open application errors modal
   * @param {*} application
   */
  openApplicationsErrorModal = (submission) => async (e) => {
    e.stopPropagation();
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await ApplicationApi.monitorStatus({
      submission_id: submission.submissionId,
    });
    const { data } = res;
    const failures = filter(
      get(data, "result"),
      (seq) =>
        seq.status == UPLOAD_FAILED ||
        seq.status == SCRIPT_ERROR ||
        seq.status == MISMATCH_SEQUENCES
    );
    console.log("failures", failures);
    this.setState({
      // reportData: _.map(failures, (fail) => ({ key: fail, ...fail })),
      reportData: failures,
      selectedApplication: submission,
      showApplicationErrorModal: true,
    });
    this.props.dispatch(ApiActions.successOnDemand());
  };

  /**
   * closing application errors modal
   */
  closeApplicationsErrorModal = () => {
    this.setState({ showApplicationErrorModal: false });
  };

  /**
   * redirect to application management screen
   */
  openApplicationManagement = (submission) => {
    if (this.state.selectedUploadedCustomer.id !== 0) {
      this.props.dispatch(ApplicationActions.setSelectedSubmission(submission));
      this.props.history.push("/applicationManagement");
      return;
    }
    //if we are showing all customers in the filter, then we need to set the customer to which selected  submission belongs
    let selectedUploadedCustomer = {
      id: submission.customerId,
      company_name: submission.companyName,
    };
    this.setState({ selectedUploadedCustomer }, () => {
      this.props.dispatch(
        CustomerActions.setBulkUploadedSelectedCustomer(
          selectedUploadedCustomer,
          () => {
            this.fetchingBulkuploadedApplications();
            this.props.dispatch(
              ApplicationActions.setSelectedSubmission(submission)
            );
            this.props.history.push("/applicationManagement");
          }
        )
      );
    });
  };

  /**
   * Delete the sequences if user selects on OK button on the confirmation modal
   */
  deleteSeq = async () => {
    let { selectedErrors } = this.state;
    this.showLoading();
    selectedErrors = selectedErrors.flatMap((i) => i.pipeline_name);
    const res = await ApplicationApi.deleteSequences({
      customer_id: this.state.selectedUploadedCustomer.id,
      submission_id: this.props.selectedSubmission.id,
      sequences: selectedErrors,
    });
    this.hideLoading();
    if (!res.data.error) {
      this.closeApplicationsErrorModal();
      this.showErrorMsg();
    } else {
      Toast.error("Please try again");
    }
  };

  showLoading = () => {
    this.props.dispatch(ApiActions.requestOnDemand());
  };

  hideLoading = () => {
    this.props.dispatch(ApiActions.successOnDemand());
  };

  //showing delete error once submission or sequence get deleted successfully
  showErrorMsg = () => {
    let deleteMsg = "";
    if (this.state.selectedErrors.length === this.reportData.length) {
      deleteMsg = "Application has";
    } else if (this.state.sequences.length > 1) {
      deleteMsg = "Sequences have";
    } else {
      deleteMsg = "Sequence has";
    }
    Toast.success(`${deleteMsg} been deleted!`);
    //clearing all the intervals after deleting the submission
    this.clearAllIntervals();
    //refresing the application once delete operation is done
    this.fetchingBulkuploadedApplications();
  };

  /**
   * Deleting selected error sequences and showing confirmation modal to display
   */
  deleteSequences = (props) => {
    this.setState({ selectedErrors: props });
    const reportData = [...this.state.reportData];
    let content_message = "";
    content_message =
      props.length === reportData.length
        ? "You chose to delete all the Sequences that will remove the Application. Do you wish to continue?"
        : "Are you sure you want to delete the selected Sequence(s)";
    Modal.confirm({
      className: "omnimodal",
      title: translate("label.generic.delete"),
      content: content_message,
      cancelText: translate("label.button.cancel"),
      onOk: () => {
        this.deleteSeq();
      },
      onCancel: () => {},
    });
  };

  render() {
    const { loading, bulkUploadedSubmissionsCount } = this.props;
    const {
      bulkUploadedSubmissions,
      limit,
      pageNo,
      TableColumns,
      selectedUploadedCustomer,
      selectedApplication,
      showApplicationErrorModal,
      reportData,
    } = this.state;
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
                  text={get(selectedUploadedCustomer, "company_name", "")}
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
              text={translate("label.submissions.applicationStatus")}
            />
          </div>

          <div className="validate-applications-layout__list">
            <TableHeader
              columns={TableColumns}
              sortColumn={this.sortColumn}
              checkAll={this.checkAll}
              viewAll={TableColumns[4].allViewable}
            />
            {map(bulkUploadedSubmissions, (application) => (
              <Row
                key={application.submissionId}
                className="validate-applications-layout__list__item"
                style={{ justifyContent: "normal" }}
              >
                <Column
                  width={this.getColumnWidth(TableColumnNames.CUSTOMER)}
                  className="validate-applications-layout__list__item-text"
                >
                  {get(application, "companyName", "N/A")}
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.APPLICATION)}
                  className="validate-applications-layout__list__item-text"
                >
                  <span
                    className={`${get(application, "errorCount") === 0 &&
                      "validate-applications-layout__list__item-text-link"}`}
                    onClick={
                      application.errorCount === 0
                        ? (e) => this.openApplicationManagement(application)
                        : ""
                    }
                  >
                    {get(application, "name", "N/A")}
                  </span>
                </Column>

                <Column
                  width={this.getColumnWidth(TableColumnNames.NOOFSEQUENCES)}
                  className="validate-applications-layout__list__item-text"
                >
                  <span
                    style={{
                      width: "102px",
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    {`${
                      !isNull(get(application, "seqCount"))
                        ? `${get(application, "seqCount", 0) -
                            get(application, "errorCount", 0)}`
                        : 0
                    } of ${
                      !isNull(get(application, "seqCount"))
                        ? get(application, "seqCount", 0)
                        : 0
                    }`}
                  </span>
                </Column>
                <Column
                  width={this.getColumnWidth(TableColumnNames.ERRORS)}
                  className="validate-applications-layout__list__item-text"
                >
                  <span
                    style={{
                      width: "33px",
                      textAlign: "center",
                      display: "block",
                    }}
                    className={`${get(application, "errorCount") != 0 &&
                      "validate-applications-layout__list__item-text-link"}`}
                    onClick={
                      application.errorCount != 0
                        ? this.openApplicationsErrorModal(application)
                        : ""
                    }
                  >
                    {get(application, "errorCount", 0)}
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
                    disabled={get(application, "errorCount") != 0}
                    className="validate-applications-layout__list__item-text"
                    checked={
                      get(application, "errorCount") == 0 &&
                      application.applicationStatus
                    }
                    onClick={this.onStatusClick(application)}
                  ></Switch>
                  <span
                    className="validate-applications-layout__list__item-text"
                    style={{ paddingLeft: "12px" }}
                  >
                    {application.applicationStatus ? "On" : "Off"}
                  </span>
                </Column>
              </Row>
            ))}
          </div>
          {!get(this.state, "bulkUploadedSubmissions.length") && (
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
          )}
          <Pagination
            key={bulkUploadedSubmissionsCount}
            containerStyle={
              bulkUploadedSubmissionsCount > 4
                ? { marginTop: "1%" }
                : { marginTop: "20%" }
            }
            total={bulkUploadedSubmissionsCount}
            showTotal={(total, range) =>
              translate("text.pagination", {
                top: range[0],
                bottom: range[1],
                total,
                type: translate("label.dashboard.applications"),
              })
            }
            pageSize={limit}
            current={pageNo}
            onPageChange={this.onPageChange}
            onPageSizeChange={this.onPageSizeChange}
          />
          {showApplicationErrorModal && (
            <ApplicationErrorsModal
              closeModal={this.closeApplicationsErrorModal}
              application={selectedApplication}
              errors={reportData}
              onDelete={this.deleteSequences}
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
    selectedUploadedCustomer: state.Customer.selectedUploadedCustomer,
    bulkUploadedSubmissions: state.Application.bulkUploadedSubmissions, //getSubmissionsByCustomer(state),
    bulkUploadedSubmissionsCount:
      state.Application.bulkUploadedSubmissionsCount,
    submissionCount: state.Application.submissionCount,
    selectedSubmission: state.Application.selectedSubmission,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...CustomerActions, ...ApplicationActions },
      dispatch
    ),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ValidateApplications);
