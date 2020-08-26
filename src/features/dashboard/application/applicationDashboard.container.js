import { Dropdown, Icon, Menu, Modal, Table } from "antd";
import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import {
  DEBOUNCE_TIME,
  POLLING_INTERVAL,
  SCRIPT_ERROR,
  UPLOAD_FAILED,
  UPLOAD_INPROGRES,
  UPLOAD_PROCESSING,
  UPLOAD_SUCCESS,
  MISMATCH_SEQUENCES,
} from "../../../constants";
import {
  ApiActions,
  ApplicationActions,
  SubmissionActions,
  CustomerActions,
  UsermanagementActions,
} from "../../../redux/actions";
import submissionActions from "../../../redux/actions/submission.actions";
import usermanagementActions from "../../../redux/actions/usermanagement.actions";
import { ApplicationApi, CustomerApi } from "../../../redux/api";
import { translate } from "../../../translations/translator";
import {
  AssignPermissionsModal,
  ContentLayout,
  DraggableModal,
  ImageLoader,
  ListViewGridView,
  Loader,
  OmniButton,
  OmniCheckbox,
  Pagination,
  Row,
  SearchBox,
  SubHeader,
  TableHeader,
  Text,
  Toast,
} from "../../../uikit/components";
import SequencesModal from "../../../uikit/components/modal/sequencesModal.component";
import {
  getFormattedDate,
  isAdmin,
  isLoggedInCustomerAdmin,
  isLoggedInOmniciaAdmin,
  isLoggedInOmniciaRole,
} from "../../../utils";
import Header from "../../header/header.component";
import AssignLicence from "../../license/assignLicence.component";
import AssignLicenceWithUsers from "../../license/assignLicenceWithUsers.component";
import LicenceInUseUnAssigned from "../../license/licenceInUseUnAssigned.component";
import SubmissionCard from "../submissionCard.component";
import ApplicationProperties from "./applicationProperties.component";
import { getSequences } from "../../../redux/selectors/submissionView.selector";

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
      showSequencesModal: false,
      selectedSubmissionMenu: "",
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
      selectedSequences: [],
      allUploadedSequences: [],
      selectedRowKeys: [],
      openDeleteSequencesConfirmModal: false,
      disableRetry: true,
      // disableDelete: true,
      TableColumns: [
        {
          name: TableColumnNames.CHECKBOX,
          checkbox: true,
          checked: false,
          sort: false,
          width: "5%",
          onCheckboxChange: this.checkAll,
        },
        {
          name: TableColumnNames.APPLICATION_NAME,
          key: "name",
          checkbox: false,
          sort: true,
          width: "15%",
        },
        {
          name: TableColumnNames.SEQUENCES,
          key: "sequence_count",
          checkbox: false,
          sort: true,
          width: "10%",
        },
        {
          name: TableColumnNames.ADDEDBY,
          key: "created_by",
          checkbox: false,
          sort: true,
          width: "26%",
          style: { paddingLeft: "15px" },
        },
        {
          name: TableColumnNames.ADDEDON,
          key: "created_at",
          checkbox: false,
          sort: true,
          width: "14%",
        },
        {
          name: TableColumnNames.LAST_UPDATED,
          key: "updated_at",
          checkbox: false,
          sort: true,
          width: "17%",
        },
        {
          name: TableColumnNames.USERS,
          checkbox: false,
          width: "14%",
        },
      ],
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
        render: (text) => (
          <Text type="regular" size="14px" text={text || 1001} />
        ),
        width: 110,
      },

      {
        title: "Error Description",
        dataIndex: "error_message",
        key: "error",
        render: (text) => (
          <Text
            type="regular"
            size="14px"
            text={text}
            textStyle={{ wordWrap: "break-word", wordBreak: "break-word" }}
          />
        ),
      },
    ];
  }

  getColumnWidth = _.memoize((name) => {
    const col = _.find(this.state.TableColumns, (col) => col.name === name);
    return _.get(col, "width");
  });

  static getDerivedStateFromProps(props, state) {
    if (
      _.get(props, "submissions.length") &&
      !_.get(state, "submissions.length")
    ) {
      /**
       * Keeping this commented code for future reference
       */
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
        submissions: _.map(props.submissions, (sub) => ({
          ...sub,
          ref: React.createRef(),
        })),
      };
    }
    return null;
  }

  async componentDidMount() {
    this.fetchApplications();
    if (!isLoggedInOmniciaRole(this.props.role)) {
      const res = await CustomerApi.getCustomerById(
        this.props.customer.id || this.props.selectedCustomer.id
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
    _.map(this.state.submissions, (submission) => {
      /**
       * Polling if the submission is still uploading
       */
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
    this.clearAllIntervals();
  }
  /**
   * clearing the intervals for the submissions uploaded
   */
  clearAllIntervals = () => {
    if (this.intervals) {
      for (const [key, val] of this.intervals.entries()) {
        clearTimeout(val);
        clearInterval(val);
      }
      this.intervals.clear();
    }
  };
  /**
   * Polling to get the status for the submission which is uploading
   * @param {*} submission
   */
  startPolling = async (submission) => {
    const res = await ApplicationApi.monitorStatus({
      submission_id: submission.id,
    });
    if (res) {
      const { data } = res;
      // const results = _.get(data, "result");
      if (_.get(data, "result.length")) {
        this.checkSequenceStatus(
          _.get(data, "result", null),
          submission,
          _.get(data, "is_uploading"),
          _.get(data, "is_submission"),
          _.get(data, "is_deleting")
        );
      }
    }
  };

  //clearInterval
  clearSubmissionInterval = (submissionId) => {
    const interval = this.intervals.get(submissionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(interval);
    }
  };
  /**
   * Checking the upload status for the sequence/submission
   * @param {*} data
   * @param {*} submission
   * @param {*} is_uploadingFlag
   * @param {*} is_submission
   * @param {*} is_deleting
   */
  checkSequenceStatus = (
    data,
    submission,
    is_uploadingFlag,
    is_submission,
    is_deleting
  ) => {
    const totalNoOfSeq = data.length;
    const inProgress = [];
    const failed = [];
    const success = [];
    const processing = [];
    _.map(data, (seq) => {
      switch (seq.status) {
        case UPLOAD_INPROGRES:
          inProgress.push(seq);
          break;
        case UPLOAD_FAILED:
        case SCRIPT_ERROR:
        case MISMATCH_SEQUENCES:
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
    submission.is_uploading = is_uploadingFlag;
    submission.sequence_count = totalNoOfSeq;
    submission.sequence_inProgress = inProgress;
    submission.sequence_failed = failed;
    submission.sequence_success = success;
    submission.sequence_processing = processing;
    submission.is_submission = is_submission;
    submission.is_deleting = is_deleting;

    if (!inProgress.length && processing.length) {
      submission.analyzing = true;
    }
    // if all are processing(Complete) or failed then clear interval
    if (processing.length == totalNoOfSeq) {
      submission.analyzing = true;
    }
    //If all are in processing state(status = 3) and the is_uploading is false
    if (processing.length == totalNoOfSeq && !submission.is_uploading) {
      submission.analyzing = false;
      this.clearSubmissionInterval(submission.id);
    }
    //If the polling stops
    if (
      !submission.is_uploading ||
      (!inProgress.length && (failed.length || failed.length == totalNoOfSeq))
    ) {
      submission.analyzing = false;
      submission.is_uploading = false;
      this.clearSubmissionInterval(submission.id);
    }
    //Updating the upload status for the submission/sequence
    this.updateSubmissions(submission);
  };
  /**
   * On click of menu on the individual submission
   * @param {*} submission
   */
  onMenuClick = (submission) => ({ key }) => {
    this.onMenuItemClick(key, submission);
  };
  /**
   * Getting menu items
   */
  getMenu = (submission) => () => {
    const style = {
      marginRight: "8px",
    };
    return (
      <Menu onClick={this.onMenuClick(submission)}>
        {!submission.is_uploading && submission.is_submission == 0 && (
          <Menu.Item key="edit">
            <div className="global__center-vert">
              <img src="/images/edit.svg" style={style} alt="Edit"/>
              <Text
                type="regular"
                size="12px"
                text={translate("label.menu.editproperties")}
              />
            </div>
          </Menu.Item>
        )}
        {!submission.is_uploading && submission.is_submission == 0 && (
          <Menu.Item key="openinomniview">
            <div className="global__center-vert">
              <img src="/images/omni-view-cloud.png" alt="cloud" style={style} />
              <Text
                type="regular"
                size="12px"
                text={translate("label.menu.openinomniview")}
                textStyle={{ marginLeft: "-4px" }}
              />
            </div>
          </Menu.Item>
        )}
        {!submission.is_uploading && submission.is_submission == 0 && (
          <Menu.Item disabled>
            <div className="global__center-vert">
              <img src="/images/omni-file.jpg" alt="File" style={style} />
              <Text
                type="regular"
                size="12px"
                text={translate("label.menu.openinomnifile")}
                textStyle={{ marginLeft: "-1px" }}
              />
            </div>
          </Menu.Item>
        )}
        {!submission.is_uploading && submission.is_submission == 0 && (
          <Menu.Item key="window">
            <div className="global__center-vert">
              <img src="/images/new-window.png" alt="New Window" style={style} />
              <Text
                type="regular"
                size="12px"
                text={translate("label.menu.openinnewwindow")}
                textStyle={{ marginLeft: "-3px" }}
              />
            </div>
          </Menu.Item>
        )}
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) &&
          !submission.is_uploading &&
          submission.is_submission == 0 && [
            <Menu.Item
              key="permissions"
              style={{ borderTop: "1px solid rgba(74, 74, 74, 0.25)" }}
            >
              <div className="global__center-vert">
                <img src="/images/assign.svg" alt="Assign" style={style} />
                <Text
                  type="regular"
                  size="12px"
                  text={translate("label.node.assignuseraccess")}
                  textStyle={{ marginLeft: "-1px" }}
                />
              </div>
            </Menu.Item>,
            <Menu.Item key="sequence">
              <div className="global__center-vert">
                <img src="/images/plus-black.svg" alt="Add" style={style} />
                <Text
                  type="regular"
                  size="12px"
                  text="Add Sequence"
                  textStyle={{ marginLeft: "1px" }}
                />
              </div>
            </Menu.Item>,
          ]}
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) &&
          submission.sequence_count > 0 && (
            <Menu.Item key="delete_sequences">
              <div className="global__center-vert global__text-red">
                <Icon
                  type="close-circle"
                  theme="outlined"
                  style={{ fontSize: "18px", marginRight: "4px" }}
                />
                <Text
                  type="regular"
                  size="12px"
                  text="Delete Sequences"
                  className="global__text-red"
                  textStyle={{ marginLeft: "2px" }}
                />
              </div>
            </Menu.Item>
          )}
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
                textStyle={{ marginLeft: "-4px" }}
              />
            </div>
          </Menu.Item>
        )}
      </Menu>
    );
  };
  /**
   * Fetching applications for the selected customer
   * @param {*} sortBy
   * @param {*} orderBy
   */
  fetchApplications = (sortBy = "name", orderBy = "ASC") => {
    this.props.actions.resetApplications();
    this.setState({ submissions: [], openFailuresModal: false });
    const { viewBy, pageNo, itemsPerPage, searchText } = this.state;
    const { selectedCustomer } = this.props;
    /**
     * If applications needs to be displayed in list view
     */
    if (viewBy === "lists") {
      selectedCustomer &&
        this.props.actions.fetchApplicationsByList(
          Number(selectedCustomer.id),
          Number(pageNo),
          Number(itemsPerPage),
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
  /**
   * Changing the view from list to Card or from card to list view
   * to display applications
   * @param {*} type
   */
  changeView = (type) => {
    const TableColumns = [...this.state.TableColumns];
    TableColumns[0].checked = false;
    this.setState(
      {
        viewBy: type,
        assignGlobalPermissions: false,
        assignPermissions: false,
        TableColumns,
      },
      () => {
        this.clearAllIntervals();
        this.fetchApplications();
      }
    );
  };
  /**
   * On selecting the submission
   * @param {*} submission
   */
  onSubmissionSelected = (submission) => () => {
    if (
      _.get(submission, "is_uploading") ||
      _.get(submission, "analyzing") ||
      _.get(submission, "is_submission") == 1
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
  /**
   * Redirecting to the customers screen
   */
  openCustomersScreen = () => {
    this.props.history.push("/");
  };
  /**
   * On page change in the list view (Pagination)
   * @param {*} pageNo
   */
  onPageChange = (pageNo) => {
    this.setState({ pageNo }, () => this.fetchApplications());
  };
  /**
   * On changing the page size (i.e. no of records to display per page)
   * @param {*} itemsPerPage
   */
  onPageSizeChange = (itemsPerPage) => {
    this.setState({ itemsPerPage }, () => this.fetchApplications());
  };
  /**
   * Columns sort in the applcations list view
   * @param {*} sortBy
   * @param {*} orderBy
   */
  sortColumn = (sortBy, orderBy) => {
    this.fetchApplications(sortBy, orderBy);
  };
  /**
   * Search
   * @param {*} e
   */
  handleSearch = (e) => {
    const searchText = e.target.value;
    this.setState({ searchText });
    if (searchText === "" || _.size(searchText) >= 3) {
      this.searchApplications();
    }
  };
  /**
   * Applications search with application name
   */
  searchApplications = () => {
    this.fetchApplications();
  };
  /**
   * Clearing the search value from the textbox
   */
  clearSearch = () => {
    this.setState({ searchText: "" });
    this.searchApplications();
  };
  /**
   * Redirecting to the usermanagement screen on click of user management button beside application name
   */
  openUserManagement = () => {
    this.props.history.push("/usermanagement");
  };
  /**
   * On selecting the each menu item
   * @param {*} key
   * @param {*} submission
   */
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
        showPropertiesModal: true,
      });
    } else if (key === "sequence") {
      this.props.actions.setSelectedSubmission(submission);
      this.props.history.push("/sequences/add");
    } else if (key === "delete") {
      this.removeSubmission(submission);
    } else if (key == "delete_sequences") {
      this.props.actions.setSelectedSubmission(submission);
      this.openSequencesModal(submission);
    }
  };
  /**
   * Deleteing application
   * @param {*} submission
   */
  removeSubmission = (submission) => {
    Modal.confirm({
      className: "omnimodal",
      title: translate("label.generic.delete"),
      content: translate("label.user.areyousuredeletesubmission", {
        name: submission.name,
      }),
      okText: translate("label.generic.delete"),
      cancelText: translate("label.button.cancel"),
      onOk: () => {
        this.props.dispatch(
          ApplicationActions.deleteSubmission(
            {
              submission_id: submission.id,
              customer_id: this.props.selectedCustomer.id,
            },
            () => {
              Toast.success("Application has been deleted!");
              //clearing all the intervals after deleting the submission
              this.clearAllIntervals();
              this.fetchApplications();
            }
          )
        );
      },
      onCancel: () => {},
    });
  };
  /**
   * Selecting the applications in bulk in list view
   * @param {*} e
   */
  checkAll = (e) => {
    const checked = _.get(e, "target.checked", false);
    if (!this.state.submissions.length) {
      e.preventDefault();
      return;
    }
    let checkedSubmissions = [];
    let submissions = this.state.submissions.slice(0, this.state.itemsPerPage);
    submissions = _.map(submissions, (submission) => ({
      ...submission,
      checked,
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
      checkedSubmissions,
    });
  };
  /**
   * selecting/unselecting the applications in list view
   * @param {*} submission
   */
  onCheckboxChange = (submission) => (e) => {
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
      checkedSubmissions,
    });
  };
  /**
   * Opening the assign permissions modal
   */
  openPermissionsModal = () => {
    this.props.dispatch(usermanagementActions.resetUsersOfFileOrSubmission());
    this.setState({ showPermissionsModal: true });
  };

  //get all sucessfully uploaded sequences for a particular submission
  getUploadedSequences = (submission) => {
    const { user } = this.props;
    if (submission) {
      // fetch sequences
      this.props.dispatch(
        SubmissionActions.fetchSequences(submission.id, user)
      );
      window.scrollTo(0, 0);
    }
  };

  //Upon sequences modal on click of delete sequences menu item
  openSequencesModal = (submission) => {
    this.getUploadedSequences(submission);
    this.setState({
      showSequencesModal: true,
      selectedSubmissionMenu: submission,
    });
  };
  //closing sequences modal
  closeSequencesModal = () => {
    this.state.selectedSubmissionMenu.ref.current.scrollIntoView({
      behavior: "smooth",
    });
    this.setState({
      showSequencesModal: false,
      selectedSubmissionMenu: "",
      selectedSequences: [],
      allUploadedSequences: [],
    });
  };
  /**
   * Assign global permissions to the applications
   */
  assignGlobalPermissions = () => {
    this.props.dispatch(usermanagementActions.resetUsers());
    this.setState({
      showPermissionsModal: true,
      assignGlobalPermissions: true,
      checkedSubmissions: this.state.submissions,
    });
  };
  /**
   * Closing the assign global persmissions modal
   */
  closePermissionsModal = () => {
    this.state.viewBy === "lists" && this.checkAll();
    this.setState({
      showPermissionsModal: false,
      assignGlobalPermissions: false,
    });
  };
  /**
   * Opening the Active licenses modal
   */
  subscriptionsInUse = () => {
    this.setState({
      showSubscriptionsInUse: true,
      showLicenceUnAssigned: false,
    });
  };
  /**
   * Assigning the licenses
   */
  subscriptionsUnAssigned = () => {
    this.setState({
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
   * Open users modal
   * @param {*} license
   */
  openUsersModal = (license) => {
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
        async () => {
          Toast.success("License has been assigned.");
          this.props.dispatch(ApiActions.requestOnDemand());
          const res = await CustomerApi.getCustomerById(
            this.props.customer.id || this.props.selectedCustomer.id
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
      showAssignLicenceToUser: false,
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

  updateSubmissionCenter = (slug) => {
    this.props.dispatch(
      ApplicationActions.updateSubmissionCenter(
        {
          submission_id: this.props.selectedSubmission.id,
          center_slug: slug,
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

  updateSubmissions = (submission) => {
    const { submissions } = this.state;
    let submissionIdx = submissions.findIndex((x) => x.id === submission.id);
    submissions[submissionIdx] = submission;
    this.setState({
      submissions,
    });
  };

  updateUploadProgress = (submission) => {
    const { submissions } = this.state;
    let submissionIdx = submissions.findIndex((x) => x.id === submission.id);
    submissions[submissionIdx] = submission;
    this.setState({
      submissions,
    });
  };

  retryUpload = () => {
    this.props.dispatch(
      ApplicationActions.retryUploads(
        { ids: _.map(this.state.selectedFailedUploads, "id") },
        () => {
          this.clearAllIntervals();
          this.fetchApplications();
        }
      )
    );
  };
  /**
   * Opening the failed report if there are any sequences failed for the sequence
   * @param {*} submission
   */
  openFailures = (submission) => async (e) => {
    e.stopPropagation();
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await ApplicationApi.monitorStatus({
      submission_id: submission.id,
    });
    const { data } = res;
    const failures = _.filter(
      _.get(data, "result"),
      (seq) =>
        seq.status == UPLOAD_FAILED ||
        seq.status == SCRIPT_ERROR ||
        seq.status == MISMATCH_SEQUENCES
    );
    console.log("failures", failures);
    // const failures = _.filter(
    //   _.get(data, "result"),
    //   seq => seq.status == UPLOAD_FAILED || seq.status == SCRIPT_ERROR
    // );
    window.scrollTo(0, 0);
    this.setState({
      reportData: _.map(failures, (fail) => ({ key: fail, ...fail })),
      openFailuresModal: true,
      selectedSubmissionMenu: submission,
    });
    this.props.dispatch(ApiActions.successOnDemand());
  };
  /**
   * Closing the failed report
   */
  closeFailuresModal = () => {
    this.state.selectedSubmissionMenu.ref.current.scrollIntoView({
      behavior: "smooth",
    });
    this.setState({ openFailuresModal: false, selectedFailedUploads: [] });
  };

  //Export to PDF
  exportToPDF = () => {
    this.showLoading();
    const res = ApplicationApi.exportViewReportPDF({
      submission_id: this.state.selectedSubmissionMenu.id,
    })
      .then((res) => {
        this.hideLoading();
        const defaultFilename = "Report.pdf";
        var data = new Blob([res.data]);
        if (typeof window.navigator.msSaveBlob === "function") {
          // If it is IE that support download blob directly.
          window.navigator.msSaveBlob(data, defaultFilename);
        } else {
          var blob = data;
          var link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = defaultFilename;
          document.body.appendChild(link);
          link.click(); // create an <a> element and simulate the click operation.
        }
      })
      .catch((error) => {
        this.hideLoading();
        console.log(error);
      });
  };

  showLoading = () => {
    this.props.dispatch(ApiActions.requestOnDemand());
  };

  hideLoading = () => {
    this.props.dispatch(ApiActions.successOnDemand());
  };

  //open delete sequences confirmation modal if user selects all the sequences
  //in the failure report window
  showDeleteSeqConfirmModal = (type) => {
    let selectedSequences = [...this.state.selectedSequences];
    const allUploadedSequences = [...this.state.allUploadedSequences];
    let selectedFailedUploads = [...this.state.selectedFailedUploads];
    const reportData = [...this.state.reportData];
    let content_message = "";
    if (type == "sucessfully_uploaded_sequences") {
      content_message =
        selectedSequences.length === allUploadedSequences.length
          ? "You chose to delete all the Sequences that will remove the Application Card from the Dashboard page. Do you wish to continue?"
          : "Are you sure you want to delete the selected Sequence(s)";
    } else if (type == "failed_sequences") {
      content_message =
        selectedFailedUploads.length == reportData.length
          ? "You chose to delete all the Sequences that will remove the Application Card from the Dashboard page. Do you wish to continue?"
          : "Are you sure you want to delete the selected Sequence(s)";
    }
    Modal.confirm({
      className: "omnimodal",
      title: translate("label.generic.delete"),
      content: content_message,
      cancelText: translate("label.button.cancel"),
      onOk: () => {
        this.deleteSequences(type);
      },
      onCancel: () => {},
    });
  };

  //check if user selects all the sequences or not for the deletion
  getDeleteSequencesData = (type) => {
    //if user selects sequences from the successfully uploaded sequences modal
    if (type == "sucessfully_uploaded_sequences") {
      this.showDeleteSeqConfirmModal("sucessfully_uploaded_sequences");
      return;
    }
    //if user select sequences from the failure report modal
    this.showDeleteSeqConfirmModal("failed_sequences");
  };

  //showing delete error once submission or sequence get deleted successfully
  showErrorMsg = (sequences, allSequences) => {
    let deleteMsg = "";
    if (sequences.length === allSequences.length) {
      deleteMsg = "Application has";
    } else if (sequences.length > 1) {
      deleteMsg = "Sequences have";
    } else {
      deleteMsg = "Sequence has";
    }
    Toast.success(`${deleteMsg} been deleted!`);
    //clearing all the intervals after deleting the submission
    this.clearAllIntervals();
    //refresing the application once delete operation is done
    this.fetchApplications();
  };

  //delete sequences
  deleteSequences = async (type) => {
    this.showLoading();
    const reportData = [...this.state.reportData];
    let selectedFailedUploads = [...this.state.selectedFailedUploads];
    const allUploadedSequences = [...this.state.allUploadedSequences];
    let selectedSequences = [...this.state.selectedSequences];
    let sequences =
      type == "failed_sequences"
        ? selectedFailedUploads.flatMap((i) => i.pipeline_name)
        : selectedSequences.flatMap((i) => i.name);
    const res = await ApplicationApi.deleteSequences({
      customer_id: this.props.selectedCustomer.id,
      submission_id: this.state.selectedSubmissionMenu.id,
      sequences: sequences,
    });
    this.hideLoading();
    if (!res.data.error) {
      this.closeFailuresModal();
      if (type == "sucessfully_uploaded_sequences") {
        this.props.dispatch(
          submissionActions.resetSequences(this.state.selectedSubmissionMenu.id)
        );
        this.closeSequencesModal();
        this.showErrorMsg(selectedSequences, allUploadedSequences);
      } else {
        this.showErrorMsg(selectedFailedUploads, reportData);
      }
    } else {
      Toast.error("Please try again");
    }
  };

  //function triggers when delete button is clicked from sucessfully uploaded sequences modal
  deleteUploadedSequences = (selectedSequences, allUploadedSequences) => {
    this.setState({ selectedSequences, allUploadedSequences }, () => {
      this.getDeleteSequencesData("sucessfully_uploaded_sequences");
    });
  };

  //on selecting rows in failure report window
  onRowSelected = (selectedRowKeys, selectedRows) => {
    const disableRetry = _.some(selectedRows, ["status", 4]);
    //const disableDelete = false;
    const { user, role } = this.props;
    if (user.is_secondary_contact || isAdmin(role.name)) {
      this.setState({
        selectedRowKeys,
        selectedFailedUploads: selectedRows,
        disableRetry,
        //disableDelete: false
      });
    }
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
      selectedFailedUploads,
      showSequencesModal,
      selectedSubmissionMenu,
      disableRetry,
      selectedRowKeys,
      //disableDelete
    } = this.state;
    const {
      loading,
      selectedCustomer,
      submissionCount,
      role,
      user,
      selectedSubmission,
    } = this.props;
    //rows selections
    console.log("selectedSubmissionMenu", selectedSubmissionMenu);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelected,
      hideDefaultSelections: true,
      selections: [
        {
          text: "Select Incorrect Sequences",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              return key.status == 4;
            });
            this.setState({
              selectedRowKeys: newSelectedRowKeys,
              selectedFailedUploads: newSelectedRowKeys,
              disableRetry: true,
            });
          },
        },
        {
          text: "Select Failed Sequences",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              return key.status != 4;
            });
            this.setState({
              selectedRowKeys: newSelectedRowKeys,
              selectedFailedUploads: newSelectedRowKeys,
              disableRetry: false,
            });
          },
        },
      ],
    };
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
                type: translate("label.dashboard.applications"),
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
                  image={<img src="/images/global-permission-white.svg" alt="Global permissions"/>}
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
                    type: translate("label.dashboard.application"),
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
                alt="Key"
                style={{ marginRight: "8px", opacity: 0.5 }}
              />
              <Text
                className="global__cursor-pointer maindashboard-licenses"
                type="bold"
                size="14px"
                opacity={0.5}
                text={`${translate("text.customer.subslicences")}:`}
                textStyle={{ marginRight: "4px" }}
                onClick={this.openSubscriptions}
              />
              <Text
                type="regular"
                className="global__cursor-pointer maindashboard-licenses-number"
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
                className="global__cursor-pointer maindashboard-licenses-number"
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
                {_.map(submissions, (submission) => (
                  <Row
                    key={submission.id}
                    className="maindashboard__list__item"
                    style={{
                      ...((submission.is_uploading ||
                        submission.analyzing ||
                        _.get(submission, "sequence_failed.length") ||
                        "") && {
                        cursor: "not-allowed",
                      }),
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
                            _.get(submission, "sequence_failed.length")
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
                                marginLeft: "-10px",
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
                          submission.is_uploading || submission.analyzing
                        }
                        overlay={this.getMenu(submission)}
                        trigger={["click"]}
                        overlayClassName="maindashboard__list__item-dropdown"
                      >
                        <img
                          className={
                            (!submission.is_uploading ||
                              !submission.analyzing) &&
                            "global__cursor-pointer"
                          }
                          src="/images/overflow-black.svg"
                          alt="Dropdown"
                          style={{
                            width: "20px",
                            height: "20px",
                            opacity:
                              submission.is_uploading || submission.analyzing
                                ? 0.2
                                : 1,
                          }}
                        />
                      </Dropdown>
                    </Column>
                  </Row>
                ))}
              </div>
              {!_.get(this.props, "submissions") &&
                !_.get(this.props, "submissions.length") && (
                  <Row className="maindashboard__nodata">
                    <Icon
                      style={{ fontSize: "20px" }}
                      type="exclamation-circle"
                      className="maindashboard__nodata-icon"
                    />
                    {translate("error.dashboard.notfound", {
                      type: translate("label.dashboard.applications"),
                    })}
                  </Row>
                )}
              <Pagination
                key={submissionCount}
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
                    type: translate("label.dashboard.applications"),
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
                {_.map(submissions, (submission) => (
                  <div ref={submission.ref}>
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      customer={selectedCustomer}
                      onSelect={this.onSubmissionSelected}
                      getMenu={this.getMenu(submission)}
                      updateSubmissions={this.updateSubmissions}
                      updateUploadProgress={this.updateUploadProgress}
                      retryUpload={this.retryUpload}
                      openFailures={this.openFailures(submission)}
                    />
                  </div>
                ))}
              </div>
              {!_.get(this.props, "submissions") &&
                !_.get(this.props, "submissions.length") && (
                  <Row className="maindashboard__nodata">
                    <Icon
                      style={{ fontSize: "20px" }}
                      type="exclamation-circle"
                      className="maindashboard__nodata-icon"
                    />
                    {translate("error.dashboard.notfound", {
                      type: translate("label.dashboard.applications"),
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
          {(showSubscriptionsInUse || showLicenceUnAssigned) && (
            <LicenceInUseUnAssigned
              type={showSubscriptionsInUse ? "inuse" : "unassigned"}
              visible={showSubscriptionsInUse || showLicenceUnAssigned}
              closeModal={this.closeSubscriptionsModal}
              customer={this.props.selectedCustomer}
              onAssignLicenseClick={this.openUsersModal}
            />
          )}
        </ContentLayout>
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
        {/* Modal to display successfully uploaded sequences */}
        {showSequencesModal && (
          <SequencesModal
            visible
            closeModal={this.closeSequencesModal}
            submission={selectedSubmissionMenu}
            onDelete={this.deleteUploadedSequences}
          />
        )}
        {/* Assign Global Permissions Modal */}
        {showPermissionsModal && (
          <AssignPermissionsModal
            visible={showPermissionsModal}
            assignGlobalPermissions={assignGlobalPermissions}
            closeModal={this.closePermissionsModal}
            submissions={checkedSubmissions}
          />
        )}
        {/* Draggable view report modal in application dashboard */}
        <DraggableModal
          visible={openFailuresModal}
          minWidth={
            _.get(selectedSubmissionMenu, "broken_x_ref", "") != 0
              ? "40%"
              : "29%"
          }
          minHeight={
            _.get(selectedSubmissionMenu, "broken_x_ref", "") != 0
              ? "65%"
              : "36%"
          }
          draggableAreaClass=".failureResults__header"
        >
          {/* Failure sequences list block starts*/}
          <div className="failureResults">
            <div className="failureResults__header" style={{ margin: "0 8px" }}>
              <Text
                type="extra_bold"
                size="16px"
                text={
                  _.get(selectedSubmissionMenu, "broken_x_ref", "") == 0
                    ? `Failure Report - ${selectedSubmissionMenu.name}`
                    : ""
                }
              />
              <img
                src="/images/close.svg"
                className="licence-modal__header-close"
                alt="Close"
                onClick={this.closeFailuresModal}
              />
            </div>
            {/* Cross references list when there are both cross-references and failed sequences */}
            {_.get(selectedSubmissionMenu, "broken_x_ref") != 0 && (
              <div className="failureResults__info-list">
                <img
                  src="/images/info_icon.png"
                  alt="Info"
                  style={{ height: "20px", margin: "-4px 5px 0 0" }}
                />
                <Text
                  type="extra_bold"
                  size="16px"
                  text="Information: Cross-referenced Sequences Not Found"
                  textStyle={{ display: "inline-block" }}
                />
                <p>
                  {_.get(selectedSubmissionMenu, "broken_x_ref", "") == 1
                    ? `A Sequence in the Application has a cross-reference to another Sequence that is not yet uploaded`
                    : `${_.get(
                        selectedSubmissionMenu,
                        "broken_x_ref",
                        ""
                      )} Sequences in the Application have the cross-references to other Sequences that are not yet uploaded`}
                </p>
              </div>
            )}
            {/* Failure sequences list*/}
            <div
              className={`failureResults__list ${
                _.get(selectedSubmissionMenu, "broken_x_ref") == 0
                  ? "no-crossrefs"
                  : "crossrefs"
              }`}
            >
              {_.get(selectedSubmissionMenu, "broken_x_ref") != 0 && (
                <div className="">
                  <img
                    src="/images/error.png"
                    alt="Error"
                    className=""
                    style={{ height: "20px", margin: "-4px 5px 0 0" }}
                  />
                  <Text
                    type="extra_bold"
                    size="16px"
                    text={`Failure Report - ${selectedSubmissionMenu.name}`}
                    textStyle={{ display: "inline-block" }}
                  />
                </div>
              )}
              <div className="failureResults__list__table">
                <div className="failureResults__list__table__body">
                  <Table
                    columns={this.uploadFailedColumns}
                    dataSource={reportData}
                    pagination={false}
                    // rowSelection={{
                    //   onChange: this.onRowSelected
                    // }}
                    rowSelection={rowSelection}
                    //scroll={{ y: 200 }}
                  />
                </div>
              </div>
              <div
                style={{ textAlign: "right" }}
                className="failureResults__list__footer"
              >
                <OmniButton
                  type="secondary"
                  label={translate("label.button.cancel")}
                  onClick={this.closeFailuresModal}
                  buttonStyle={{ width: "120px", margin: "10px 0 0 10px" }}
                />
                {/* As per the ticket OMNG-682 we are allowing retry option only for
              secondary contact and admins*/}
                {user.is_secondary_contact || isAdmin(role.name) ? (
                  <OmniButton
                    disabled={!selectedFailedUploads.length || disableRetry}
                    label="Retry"
                    buttonStyle={{ width: "120px", margin: "10px 0 0 10px" }}
                    onClick={this.retryUpload}
                  />
                ) : (
                  ""
                )}
                <OmniButton
                  disabled={!selectedFailedUploads.length}
                  label="Delete"
                  buttonStyle={{ width: "120px", margin: "10px 0 0 10px" }}
                  onClick={(e) =>
                    this.getDeleteSequencesData("failed_sequences")
                  }
                />
                <OmniButton
                  type="primary"
                  label={translate("label.button.export")}
                  onClick={this.exportToPDF}
                  buttonStyle={{ width: "120px", margin: "10px 0 0 10px" }}
                />
              </div>
            </div>
          </div>
          {/* Failure sequences list ends */}
        </DraggableModal>
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
  USERS: translate("label.dashboard.users"),
};

const Column = styled.div`
  width: ${(props) => props.width};
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
    customer: state.Login.customer,
    access: state.Application.access,
    sequences: getSequences(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      { ...ApplicationActions, SubmissionActions },
      dispatch
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationDashboard);
