import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import _ from "lodash";
import { Icon, Dropdown, Menu, Avatar, Modal, Table } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SubmissionCard from "../submissionCard.component";
import {
  ApplicationActions,
  SubmissionActions,
  UsermanagementActions,
  CustomerActions,
  ApiActions
} from "../../../redux/actions";
import Header from "../../header/header.component";
import styled from "styled-components";
import {
  DEBOUNCE_TIME,
  POLLING_INTERVAL,
  UPLOAD_INPROGRES,
  UPLOAD_INPROGRES_EXTRA,
  UPLOAD_FAILED,
  UPLOAD_SUCCESS,
  UPLOAD_PROCESSING
} from "../../../constants";
import {
  isLoggedInOmniciaRole,
  isLoggedInCustomerAdmin,
  getFormattedDate,
  isLoggedInOmniciaAdmin,
  isAdmin
} from "../../../utils";
import {
  Loader,
  Footer,
  TableHeader,
  Row,
  Pagination,
  OmniCheckbox,
  OmniButton,
  SearchBox,
  ListViewGridView,
  SubHeader,
  ContentLayout,
  AssignPermissionsModal,
  Text,
  Toast,
  ImageLoader
} from "../../../uikit/components";
import { translate } from "../../../translations/translator";
import submissionActions from "../../../redux/actions/submission.actions";
import usermanagementActions from "../../../redux/actions/usermanagement.actions";
import LicenceInUseUnAssigned from "../../license/licenceInUseUnAssigned.component";
import AssignLicence from "../../license/assignLicence.component";
import AssignLicenceWithUsers from "../../license/assignLicenceWithUsers.component";
import { CustomerApi, ApplicationApi } from "../../../redux/api";
import ApplicationProperties from "./applicationProperties.component";
// import { Customers } from "./sampleCustomers";
// import  ApplicationApi  from "../../../redux/api/application.api"

class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);
    this.intervals = new Map();
    this.state = {
      viewBy: "cards",
      pageNo: 1,
      itemsPerPage: 5,
      searchText: "",
      submissions: [],
      assignGlobalPermissions: false,
      assignPermissions: false,
      showPermissionsModal: false,
      showSubscriptionsInUse: false,
      showLicenceUnAssigned: false,
      showUsersModal: false,
      showAssignLicenceToUser: false,
      assigningLicence: null,
      selectedUsers: null,
      checkedSubmissions: [],
      showPropertiesModal: false,
      editingSubmission: null,
      reportData: [],
      openFailuresModal: false,
      selectedFailedUploads: [],
      TableColumns: [
        {
          name: TableColumnNames.CHECKBOX,
          checkbox: true,
          checked: false,
          sort: false,
          width: "5%",
          onCheckboxChange: this.checkAll
        },
        {
          name: TableColumnNames.APPLICATION_NAME,
          key: "name",
          checkbox: false,
          sort: true,
          width: "15%"
        },
        {
          name: TableColumnNames.SEQUENCES,
          key: "sequence_count",
          checkbox: false,
          sort: true,
          width: "10%"
        },
        {
          name: TableColumnNames.ADDEDBY,
          key: "created_by",
          checkbox: false,
          sort: true,
          width: "26%",
          style: { paddingLeft: "15px" }
        },
        {
          name: TableColumnNames.ADDEDON,
          key: "created_at",
          checkbox: false,
          sort: true,
          width: "14%"
        },
        {
          name: TableColumnNames.LAST_UPDATED,
          key: "updated_at",
          checkbox: false,
          sort: true,
          width: "17%"
        },
        {
          name: TableColumnNames.USERS,
          checkbox: false,
          width: "14%"
        }
      ]
    };
    this.searchApplications = _.debounce(
      this.searchApplications,
      DEBOUNCE_TIME
    );
    this.uploadFailedColumns = [
      {
        title: "Sequence #",
        dataIndex: "pipeline_name",
        key: "id",
        render: text => <Text type="regular" size="14px" text={text || 1001} />,
        width: 110
      },

      {
        title: "Error Description",
        dataIndex: "error_message",
        key: "error",
        render: text => (
          <Text
            type="regular"
            size="14px"
            text={text}
            textStyle={{ wordWrap: "break-word", wordBreak: "break-word" }}
          />
        )
      }
    ];
  }

  getColumnWidth = _.memoize(name => {
    const col = _.find(this.state.TableColumns, col => col.name === name);
    return _.get(col, "width");
  });

  static getDerivedStateFromProps(props, state) {
    if (
      _.get(props, "submissions.length") &&
      !_.get(state, "submissions.length")
    ) {
      /* let submissions = props.submissions;
      _.map(submissions, submission => {
        if (submission.is_uploading) {
          ApplicationDashboard.startPolling(submission);
          const interval = setInterval(() => {
            ApplicationDashboard.startPolling(submission);
          }, POLLING_INTERVAL);
          
        }
      }); */
      return {
        submissions: props.submissions
      };
    }
    return null;
  }

  async componentDidMount() {
    this.fetchApplications();
    if (!isLoggedInOmniciaRole(this.props.role)) {
      const res = await CustomerApi.getCustomerById(
        this.props.selectedCustomer.id
      );
      this.props.dispatch(CustomerActions.setSelectedCustomer(res.data.data));
    }
    if (!isAdmin(this.props.role.slug)) {
      const TableColumns = [...this.state.TableColumns];
      TableColumns.shift();
      this.setState({ TableColumns });
    }
  }

  componentDidUpdate() {
    if (!this.state.submissions.length) {
      return;
    }
    _.map(this.state.submissions, submission => {
      if (submission.is_uploading && !this.intervals.get(submission.id)) {
        this.startPolling(submission);
        const interval = setInterval(() => {
          this.startPolling(submission);
        }, POLLING_INTERVAL);
        this.intervals.set(submission.id, interval);
      }
    });
  }

  componentWillUnmount() {
    this.intervals && this.intervals.clear();
  }

  startPolling = async submission => {
    const res = await ApplicationApi.monitorStatus({
      submission_id: submission.id
    });
    if (res) {
      const { data } = res;
      if (_.get(data, "result")) {
        this.checkSequenceStatus(_.get(data, "result", null), submission);
      } else {
        const interval = this.intervals.get(submission.id);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(interval);
        }
      }
    }
  };

  checkSequenceStatus = (data, submission) => {
    const totalNoOfSeq = data.length;
    const inProgress = [];
    const failed = [];
    const success = [];
    const processing = [];
    _.map(data, seq => {
      switch (seq.status) {
        case UPLOAD_INPROGRES:
        case UPLOAD_INPROGRES_EXTRA:
          inProgress.push(seq);
          break;
        case UPLOAD_FAILED:
          failed.push(seq);
          break;
        case UPLOAD_SUCCESS:
          success.push(seq);
          break;
        case UPLOAD_PROCESSING:
          processing.push(seq);
          break;
      }
    });
    submission.sequence_count = totalNoOfSeq;
    submission.sequence_inProgress = inProgress;
    submission.sequence_failed = failed;
    submission.sequence_success = success;
    submission.sequence_processing = processing;
    if (!inProgress.length && processing.length) {
      submission.analyzing = true;
    }
    // if all are processing(Complete) or failed then clear interval
    if (processing.length == totalNoOfSeq || failed.length == totalNoOfSeq) {
      submission.is_uploading = false;
      submission.analyzing = false;
      const interval = this.intervals.get(submission.id);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(interval);
      }
    }
    this.updateSubmissions(submission);
  };

  onMenuClick = submission => ({ key }) => {
    this.onMenuItemClick(key, submission);
  };

  getMenu = submission => () => {
    const style = {
      marginRight: "8px"
    };
    return (
      <Menu onClick={this.onMenuClick(submission)}>
        <Menu.Item key="edit">
          <div className="global__center-vert">
            <img src="/images/edit.svg" style={style} />
            <Text
              type="regular"
              size="12px"
              text={translate("label.menu.editproperties")}
            />
          </div>
        </Menu.Item>
        <Menu.Item key="openinomniview">
          <div className="global__center-vert">
            <img src="/images/omni-view-cloud.png" style={style} />
            <Text
              type="regular"
              size="12px"
              text={translate("label.menu.openinomniview")}
            />
          </div>
        </Menu.Item>
        <Menu.Item disabled>
          <div className="global__center-vert">
            <img src="/images/omni-file.jpg" style={style} />
            <Text
              type="regular"
              size="12px"
              text={translate("label.menu.openinomnifile")}
            />
          </div>
        </Menu.Item>
        <Menu.Item key="window">
          <div className="global__center-vert">
            <img src="/images/new-window.png" style={style} />
            <Text
              type="regular"
              size="12px"
              text={translate("label.menu.openinnewwindow")}
            />
          </div>
        </Menu.Item>
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) && [
          <Menu.Item
            key="permissions"
            style={{ borderTop: "1px solid rgba(74, 74, 74, 0.25)" }}
          >
            <div className="global__center-vert">
              <img src="/images/assign.svg" style={style} />
              <Text
                type="regular"
                size="12px"
                text={translate("label.node.assignuseraccess")}
              />
            </div>
          </Menu.Item>,
          <Menu.Item key="sequence">
            <div className="global__center-vert">
              <img src="/images/plus-black.svg" style={style} />
              <Text type="regular" size="12px" text="Add Sequence" />
            </div>
          </Menu.Item>
        ]}
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) && (
          <Menu.Item key="delete">
            <div className="global__center-vert global__text-red">
              <Icon
                type="delete"
                theme="filled"
                style={{ fontSize: "20px", marginRight: "8px" }}
              />
              <Text
                type="regular"
                size="12px"
                text="Delete Application"
                className="global__text-red"
              />
            </div>
          </Menu.Item>
        )}
      </Menu>
    );
  };

  fetchApplications = (sortBy = "name", orderBy = "ASC") => {
    this.props.actions.resetApplications();
    this.setState({ submissions: [] });
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
    const TableColumns = [...this.state.TableColumns];
    TableColumns[0].checked = false;
    this.setState(
      {
        viewBy: type,
        assignGlobalPermissions: false,
        assignPermissions: false,
        TableColumns
      },
      () => this.fetchApplications()
    );
  };

  onSubmissionSelected = submission => () => {
    if (
      _.get(submission, "is_uploading") ||
      _.get(submission, "analyzing") ||
      _.get(submission, "sequence_failed", []).length
    ) {
      return;
    }
    this.props.actions.setSelectedSubmission(submission);
    this.props.dispatch(
      submissionActions.resetSequences(submission.id, () => {
        this.props.history.push("/submission");
      })
    );
  };

  openCustomersScreen = () => {
    this.props.history.push("/");
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
    } else if (key === "permissions") {
      this.setState({ checkedSubmissions: [submission] });
      this.openPermissionsModal();
    } else if (key === "openinomniview") {
      this.onSubmissionSelected(submission)();
    } else if (key === "edit") {
      this.props.actions.setSelectedSubmission(submission);
      this.setState({
        showPropertiesModal: true
      });
    } else if (key === "sequence") {
      this.props.actions.setSelectedSubmission(submission);
      this.props.history.push("/sequences/add");
    } else if (key === "delete") {
      this.removeSubmission(submission);
    }
  };

  removeSubmission = submission => {
    Modal.confirm({
      className: "omnimodal",
      title: translate("label.generic.delete"),
      content: translate("label.user.areyousuredeletesubmission", {
        name: submission.name
      }),
      okText: translate("label.generic.delete"),
      cancelText: translate("label.button.cancel"),
      onOk: () => {
        this.props.dispatch(
          ApplicationActions.deleteSubmission(
            {
              submission_id: submission.id,
              customer_id: this.props.selectedCustomer.id
            },
            () => {
              Toast.success("Application has been deleted!");
              this.fetchApplications();
            }
          )
        );
      },
      onCancel: () => {}
    });
  };

  checkAll = e => {
    const checked = _.get(e, "target.checked", false);
    if (!this.state.submissions.length) {
      e.preventDefault();
      return;
    }
    let checkedSubmissions = [];
    let submissions = this.state.submissions.slice(0, this.state.itemsPerPage);
    submissions = _.map(submissions, submission => ({
      ...submission,
      checked
    }));
    if (checked) {
      checkedSubmissions = [...submissions];
    } else {
      checkedSubmissions.length = 0;
    }
    const TableColumns = [...this.state.TableColumns];
    TableColumns[0].checked = checked;
    this.setState({
      submissions,
      TableColumns,
      // assignGlobalPermissions: checked,
      assignPermissions: checkedSubmissions.length !== 0,
      checkedSubmissions
    });
  };

  onCheckboxChange = submission => e => {
    const checked = e.target.checked;
    const submissions = this.state.submissions.slice(
      0,
      this.state.itemsPerPage
    );
    submission.checked = checked;

    const TableColumns = [...this.state.TableColumns];
    let assignGlobalPermissions = false;
    let assignPermissions = false;
    const checkedSubmissions = [...this.state.checkedSubmissions];
    if (checked) {
      assignGlobalPermissions = _.every(submissions, ["checked", true]);
      checkedSubmissions.push(submission);
    } else {
      _.remove(checkedSubmissions, submission);
    }
    TableColumns[0].checked = assignGlobalPermissions;
    // if (!assignGlobalPermissions) {
    assignPermissions = _.some(submissions, ["checked", true]);
    // }
    this.setState({
      submissions,
      TableColumns,
      // assignGlobalPermissions,
      assignPermissions,
      checkedSubmissions
    });
  };

  openPermissionsModal = () => {
    this.props.dispatch(usermanagementActions.resetUsersOfFileOrSubmission());
    this.setState({ showPermissionsModal: true });
  };

  assignGlobalPermissions = () => {
    this.props.dispatch(usermanagementActions.resetUsers());
    this.setState({
      showPermissionsModal: true,
      assignGlobalPermissions: true,
      checkedSubmissions: this.state.submissions
    });
  };

  closePermissionsModal = () => {
    this.state.viewBy === "lists" && this.checkAll();
    this.setState({
      showPermissionsModal: false,
      assignGlobalPermissions: false
    });
  };

  subscriptionsInUse = () => {
    this.setState({
      showSubscriptionsInUse: true,
      showLicenceUnAssigned: false
    });
  };

  subscriptionsUnAssigned = () => {
    this.setState({
      showLicenceUnAssigned: true,
      showSubscriptionsInUse: false
    });
  };

  closeSubscriptionsModal = () => {
    this.setState({
      showSubscriptionsInUse: false,
      showLicenceUnAssigned: false
    });
  };

  openUsersModal = license => {
    this.setState({
      showLicenceUnAssigned: false,
      showAssignLicenceToUser: false,
      showUsersModal: true,
      assigningLicence: license
    });
  };

  goBackToUsersModal = () => {
    this.setState({
      showAssignLicenceToUser: false,
      showUsersModal: true
    });
  };

  closeUsersModal = () => {
    this.setState({
      selectedUsers: null,
      showUsersModal: false,
      assigningLicence: null
    });
  };

  closeAssignLicenceToUserModal = () => {
    this.setState({
      selectedUsers: null,
      showAssignLicenceToUser: false
    });
  };

  onUserSelect = users => {
    this.setState({
      showAssignLicenceToUser: true,
      showUsersModal: false,
      selectedUsers: users
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
        user_id: user.user_id
      };
    });
    this.props.dispatch(
      UsermanagementActions.assignLicense(
        {
          licenses
        },
        async () => {
          /* Toast.success(
            `License has been assigned to ${_.get(
              selectedUsers,
              "first_name",
              ""
            )} ${_.get(selectedUsers, "last_name", "")}`
          ); */
          Toast.success("License has been assigned.");
          this.props.dispatch(ApiActions.requestOnDemand());
          const res = await CustomerApi.getCustomerById(
            this.props.selectedCustomer.id
          );
          this.props.dispatch(
            CustomerActions.setSelectedCustomer(res.data.data)
          );
          this.props.dispatch(ApiActions.successOnDemand());
        }
      )
    );
    this.setState({
      selectedUsers: null,
      showAssignLicenceToUser: false
    });
  };

  openSubscriptions = () => {
    if (isLoggedInCustomerAdmin(this.props.role)) {
      this.props.history.push("/subscriptions");
      return;
    }
    this.props.history.push("/usermanagement/customer/edit/subscriptions");
  };

  closePropertiesModal = () => {
    this.setState({ showPropertiesModal: false });
  };

  updateSubmissionCenter = slug => {
    this.props.dispatch(
      ApplicationActions.updateSubmissionCenter(
        {
          submission_id: this.props.selectedSubmission.id,
          center_slug: slug
        },
        () => {
          this.fetchApplications();
          this.closePropertiesModal();
        }
      )
    );
  };

  addNewApplication = () => {
    this.props.history.push("/applications/add");
  };

  updateSubmissions = submission => {
    const { submissions } = this.state;
    let submissionIdx = submissions.findIndex(x => x.id === submission.id);
    submissions[submissionIdx] = submission;
    this.setState({
      submissions
    });
  };

  updateUploadProgress = submission => {
    const { submissions } = this.state;
    let submissionIdx = submissions.findIndex(x => x.id === submission.id);
    submissions[submissionIdx] = submission;
    this.setState({
      submissions
    });
  };

  retryUpload = () => {
    this.props.dispatch(
      ApplicationActions.retryUploads(
        { ids: _.map(this.state.selectedFailedUploads, "id") },
        () => {
          this.fetchApplications();
        }
      )
    );
  };

  openFailures = submission => async () => {
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await ApplicationApi.monitorStatus({
      submission_id: submission.id
    });
    const { data } = res;
    const failures = _.filter(
      _.get(data, "result"),
      seq => seq.status == UPLOAD_FAILED
    );
    this.setState({
      reportData: failures,
      openFailuresModal: true
    });
    this.props.dispatch(ApiActions.successOnDemand());
  };

  closeFailuresModal = () => {
    this.setState({ openFailuresModal: false });
  };

  render() {
    const {
      viewBy,
      searchText,
      TableColumns,
      submissions,
      assignGlobalPermissions,
      assignPermissions,
      showPermissionsModal,
      checkedSubmissions,
      showSubscriptionsInUse,
      showLicenceUnAssigned,
      openFailuresModal,
      reportData,
      selectedFailedUploads
    } = this.state;
    const {
      loading,
      selectedCustomer,
      submissionCount,
      role,
      user
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
            <div className="maindashboard__header__section">
              <div style={{ marginBottom: "8px" }}>
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
              {isAdmin(role.slug) && submissions.length !== 0 && (
                <OmniButton
                  type="add"
                  image={<img src="/images/global-permissions.svg" />}
                  label={translate("label.dashboard.assignglobalpermissions")}
                  className="maindashboard-assignpermissions"
                  buttonStyle={{ marginRight: "4px" }}
                  onClick={this.assignGlobalPermissions}
                />
              )}
            </div>
            {(isLoggedInOmniciaAdmin(this.props.role) ||
              isLoggedInCustomerAdmin(this.props.role) ||
              user.is_secondary_contact) && (
              <React.Fragment>
                <OmniButton
                  type="add"
                  label={translate("label.button.add", {
                    type: translate("label.dashboard.application")
                  })}
                  buttonStyle={{ height: "40px" }}
                  onClick={this.addNewApplication}
                />
              </React.Fragment>
            )}
          </div>
          {(isLoggedInOmniciaAdmin(role) || isLoggedInCustomerAdmin(role)) && (
            <div className="global__center-vert" style={{ marginTop: "10px" }}>
              <img
                src="/images/key.svg"
                style={{ marginRight: "8px", opacity: 0.5 }}
              />
              <Text
                className="global__cursor-pointer"
                type="bold"
                size="14px"
                opacity={0.5}
                text={`${translate("text.customer.subslicences")}:`}
                textStyle={{ marginRight: "4px" }}
                onClick={this.openSubscriptions}
              />
              <Text
                type="regular"
                className="global__cursor-pointer"
                size="14px"
                text={`${_.get(
                  selectedCustomer,
                  "assigned_licenses",
                  0
                )} ${translate("label.generic.inuse")}`}
                textStyle={{ marginRight: "8px" }}
                onClick={this.subscriptionsInUse}
              />
              <Text
                type="regular"
                className="global__cursor-pointer"
                size="14px"
                text={`${_.get(selectedCustomer, "revoked_licenses", 0) +
                  _.get(
                    selectedCustomer,
                    "unassigned_licenses",
                    0
                  )} ${translate("label.generic.unassigned")}`}
                onClick={this.subscriptionsUnAssigned}
              />
            </div>
          )}
          {viewBy === "lists" && (
            <React.Fragment>
              {(isLoggedInOmniciaAdmin(this.props.role) ||
                isLoggedInCustomerAdmin(this.props.role)) && (
                <div
                  className="global__center-vert"
                  style={{ height: "40px", marginTop: "12px" }}
                >
                  <OmniButton
                    type="primary"
                    disabled={!assignPermissions}
                    label={translate("label.dashboard.assignpermissions")}
                    onClick={this.openPermissionsModal}
                  />
                </div>
              )}
              <div className="maindashboard__list">
                <TableHeader
                  columns={TableColumns}
                  sortColumn={this.sortColumn}
                />
                {_.map(submissions, submission => (
                  <Row
                    key={submission.id}
                    className="maindashboard__list__item"
                    style={{
                      ...((submission.is_uploading ||
                        submission.analyzing ||
                        _.get(submission, "sequence_failed.length") ||
                        "") && {
                        cursor: "not-allowed"
                      })
                    }}
                  >
                    {isAdmin(role.slug) && (
                      <Column
                        width={this.getColumnWidth(TableColumnNames.CHECKBOX)}
                      >
                        <OmniCheckbox
                          disabled={
                            submission.is_uploading ||
                            submission.analyzing ||
                            _.get(submission, "sequence_failed.length") ||
                            true
                          }
                          checked={submission.checked}
                          onCheckboxChange={this.onCheckboxChange(submission)}
                        />
                      </Column>
                    )}
                    <Column
                      width={this.getColumnWidth(
                        TableColumnNames.APPLICATION_NAME
                      )}
                      className="maindashboard__list__item-text-bold"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {_.get(submission, "name", "")}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.SEQUENCES)}
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {(() => {
                        if (
                          _.get(submission, "sequence_inProgress.length") ==
                            0 &&
                          _.get(submission, "sequence_failed.length") != 0
                        ) {
                          return (
                            <OmniButton
                              label="View Report"
                              onClick={this.openFailures(submission)}
                              type="danger"
                              buttonStyle={{
                                padding: "0px",
                                width: "80px",
                                marginLeft: "-10px"
                              }}
                            />
                          );
                        }
                        if (_.get(submission, "analyzing")) {
                          return "Processing uploaded sequence(s)...";
                        }
                        if (_.get(submission, "is_uploading")) {
                          return "Upload is in progress...";
                        }
                        return _.get(submission, "sequence_count", 0);
                      })()}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.ADDEDBY)}
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      <ImageLoader
                        type="circle"
                        width="30px"
                        height="30px"
                        style={{ marginRight: "10px" }}
                        path={submission.profile}
                      />
                      {_.get(submission, "created_by") || "Corabelle Durrad"}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.ADDEDON)}
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {getFormattedDate(_.get(submission, "created_at"))}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.LAST_UPDATED)}
                      className="maindashboard__list__item-text"
                      onClick={this.onSubmissionSelected(submission)}
                    >
                      {getFormattedDate(_.get(submission, "updated_at"))}
                    </Column>
                    <Column
                      width={this.getColumnWidth(TableColumnNames.USERS)}
                      className="maindashboard__list__item__row maindashboard__list__item-text"
                    >
                      <div>{this.props.selectedCustomer.number_of_users}</div>
                      <Dropdown
                        disabled={
                          submission.is_uploading ||
                          submission.analyzing ||
                          _.get(submission, "sequence_failed.length")
                        }
                        overlay={this.getMenu(submission)}
                        trigger={["click"]}
                        overlayClassName="maindashboard__list__item-dropdown"
                      >
                        <img
                          className={
                            (!submission.is_uploading ||
                              !submission.analyzing ||
                              !_.get(submission, "sequence_failed.length")) &&
                            "global__cursor-pointer"
                          }
                          src="/images/overflow-black.svg"
                          style={{
                            width: "20px",
                            height: "20px",
                            opacity:
                              submission.is_uploading ||
                              submission.analyzing ||
                              _.get(submission, "sequence_failed.length")
                                ? 0.2
                                : 1
                          }}
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
                    customer={selectedCustomer}
                    onSelect={this.onSubmissionSelected}
                    getMenu={this.getMenu(submission)}
                    updateSubmissions={this.updateSubmissions}
                    updateUploadProgress={this.updateUploadProgress}
                    retryUpload={this.retryUpload}
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
          <AssignLicence
            visible={this.state.showAssignLicenceToUser}
            licence={this.state.assigningLicence}
            users={this.state.selectedUsers}
            closeModal={this.closeAssignLicenceToUserModal}
            back={this.goBackToUsersModal}
            submit={this.assignLicence}
          />
          {showPermissionsModal && (
            <AssignPermissionsModal
              visible={showPermissionsModal}
              assignGlobalPermissions={assignGlobalPermissions}
              closeModal={this.closePermissionsModal}
              submissions={checkedSubmissions}
            />
          )}
          {(showSubscriptionsInUse || showLicenceUnAssigned) && (
            <LicenceInUseUnAssigned
              type={showSubscriptionsInUse ? "inuse" : "unassigned"}
              visible={showSubscriptionsInUse || showLicenceUnAssigned}
              closeModal={this.closeSubscriptionsModal}
              customer={this.props.selectedCustomer}
              onAssignLicenseClick={this.openUsersModal}
            />
          )}
          {this.state.showUsersModal && (
            <AssignLicenceWithUsers
              licence={this.state.assigningLicence}
              selectedUsers={this.state.selectedUsers}
              closeModal={this.closeUsersModal}
              onUserSelect={this.onUserSelect}
            />
          )}
          {this.state.showPropertiesModal && (
            <ApplicationProperties
              visible
              closeModal={this.closePropertiesModal}
              submit={this.updateSubmissionCenter}
            />
          )}
          <Modal
            destroyOnClose
            visible={openFailuresModal}
            closable={false}
            footer={null}
            width="65%"
          >
            <div
              className="licence-modal__header"
              style={{ marginBottom: "15px" }}
            >
              <Text type="extra_bold" size="16px" text="Failure Report" />
              <img
                src="/images/close.svg"
                className="licence-modal__header-close"
                onClick={this.closeFailuresModal}
              />
            </div>
            <Table
              columns={this.uploadFailedColumns}
              dataSource={reportData}
              pagination={false}
              rowSelection={{
                onChange: (selectedRowKeys, selectedRows) => {
                  this.setState({ selectedFailedUploads: selectedRows });
                }
              }}
              scroll={{ y: 200 }}
            />
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <OmniButton
                type="secondary"
                label={translate("label.button.cancel")}
                onClick={this.closeFailuresModal}
                buttonStyle={{ width: "120px", marginRight: "12px" }}
              />
              <OmniButton
                disabled={!selectedFailedUploads.length}
                label="Retry"
                buttonStyle={{ width: "120px", marginRight: "10px" }}
                onClick={this.retryUpload}
              />
            </div>
          </Modal>
        </ContentLayout>
      </React.Fragment>
    );
  }
}

const TableColumnNames = {
  CHECKBOX: "",
  APPLICATION_NAME: translate("label.newapplication.applicationnumber"),
  SEQUENCES: translate("label.dashboard.sequences"),
  ADDEDBY: translate("label.dashboard.addedby"),
  ADDEDON: translate("label.dashboard.addedon"),
  LAST_UPDATED: translate("label.dashboard.lastupdated"),
  USERS: translate("label.dashboard.users")
};

const Column = styled.div`
  width: ${props => props.width};
`;

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    submissions: state.Application.submissions, //getSubmissionsByCustomer(state),
    selectedCustomer: state.Customer.selectedCustomer,
    submissionCount: state.Application.submissionCount,
    selectedSubmission: state.Application.selectedSubmission,
    user: state.Login.user,
    access: state.Application.access
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators({ ...ApplicationActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationDashboard);
