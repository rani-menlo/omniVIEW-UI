import { Breadcrumb, Modal, Table } from "antd";
import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import { ApiActions } from "../../../redux/actions";
import { ApplicationApi } from "../../../redux/api";
import { translate } from "../../../translations/translator";
import {
  ContentLayout,
  Loader,
  OmniButton,
  Text,
  Toast
} from "../../../uikit/components";
import { minFourDigitsInString } from "../../../utils";
import Header from "../../header/header.component";
import ApplicationDetails from "./applicationDetails.component";
import ChooseCloud from "./chooseCloud.component";
import RemoteDetails from "./remoteDetails.component";
import RemoteFiles from "./remoteFiles.component";

const columns = [
  {
    title: "Folder Name",
    key: "folder",
    dataIndex: "folder"
  },
  {
    title: "Description",
    key: "message",
    dataIndex: "message"
  }
];

class AddNewApplication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCloud: "",
      showClouds: true,
      enterRemoteDetails: false,
      path: "",
      ftp_files_path: [],
      auth_id: "",
      remoteDetails: null,
      remoteFiles: null,
      showRemoteFiles: false,
      selectedFolderError: "",
      invalidSeqError: "",
      showApplicationDetails: false,
      regions: [],
      submission_centers: [],
      application_types: [],
      cloud_types: [],
      defaultApplicationType: "",
      defaultApplicationNumber: "",
      isAddingSequence: false,
      openInvalidSequenceModal: false,
      addApplicationinvalidSeq: [],
      proceedToAppDetails: false,
      checkedAll: false,
      showCheckAll: false,
      showInvalidSeqFooter: false
    };
  }

  componentDidMount() {
    const isAddingSequence = this.props.history.location.pathname.endsWith(
      "/sequences/add"
    );
    this.setState({ isAddingSequence });
  }

  showLoading = () => {
    this.props.dispatch(ApiActions.requestOnDemand());
  };

  hideLoading = () => {
    this.props.dispatch(ApiActions.successOnDemand());
  };

  onCloudSelect = async cloud => {
    this.showLoading();
    const res = await ApplicationApi.getFTPDetails(
      this.props.selectedCustomer.id
    );
    let remoteDetails = null;
    if (!res.data.error) {
      remoteDetails = res.data.data;
    }
    this.setState(
      {
        remoteDetails,
        selectedCloud: cloud.name,
        showClouds: false,
        enterRemoteDetails: true
      },
      this.hideLoading
    );
  };

  showClouds = () => {
    this.setState({
      selectedCloud: "",
      selectedFolderError: "",
      invalidSeqError: "",
      showClouds: true,
      enterRemoteDetails: false
    });
  };

  enterRemoteDetails = () => {
    this.setState({
      showRemoteFiles: false,
      enterRemoteDetails: true,
      selectedFolderError: "",
      invalidSeqError: ""
    });
  };

  showRemoteFiles = async remoteDetails => {
    remoteDetails.customer_id = this.props.selectedCustomer.id;
    remoteDetails.id = _.get(this.state, "remoteDetails.id", "");
    this.showLoading();
    let res = await ApplicationApi.saveFTPDetails(remoteDetails);
    let auth_id = "";
    if (!res.data.error) {
      auth_id = res.data.data.auth_id;
      res = await ApplicationApi.getContentsOfPath({
        customer_id: this.props.selectedCustomer.id,
        ...(!_.isEmpty(remoteDetails.ftp_path) && {
          ftp_path: remoteDetails.ftp_path
        })
      });
      let remoteFiles = null;
      if (!res.data.error) {
        remoteFiles = res.data.data;
      }
      this.setState(
        {
          remoteDetails,
          path: remoteDetails.ftp_path,
          auth_id,
          remoteFiles,
          selectedFolderError: "",
          invalidSeqError: "",
          checkedAll: false,
          showRemoteFiles: true,
          enterRemoteDetails: false,
          showApplicationDetails: false
        },
        this.hideLoading
      );
    } else {
      this.setState(
        { selectedFolderError: res.data.message },
        this.hideLoading
      );
    }
  };

  cancelApplicationDetails = () => {
    this.setState(
      {
        showRemoteFiles: true,
        enterRemoteDetails: false,
        showApplicationDetails: false,
        selectedFolderError: "",
        invalidSeqError: ""
      },
      () => {
        this.goBack(true);
      }
    );
  };

  getContentsOfPath = async path => {
    this.showLoading();
    let showCheckAll = false;
    const res = await ApplicationApi.getContentsOfPath({
      customer_id: this.props.selectedCustomer.id,
      ftp_path: path
    });
    let remoteFiles = null;
    if (!res.data.error) {
      remoteFiles = res.data.data;
      showCheckAll = _.some(remoteFiles, file =>
        minFourDigitsInString(file.name)
      );
    }
    this.setState(
      {
        remoteFiles,
        path,
        selectedFolderError: "",
        invalidSeqError: "",
        checkedAll: false,
        showCheckAll
      },
      this.hideLoading
    );
  };

  getContents = async file => {
    let { path } = this.state;
    this.setState({
      ftp_files_path: [...this.state.ftp_files_path, file.name]
    });
    path = `${path}/${file.name}`;
    await this.getContentsOfPath(path);
  };

  //triggering the event when user clicks on checkbox
  checkedFolder = (file, event) => {
    let remoteFiles = [...this.state.remoteFiles];
    let checkedArray = [];
    let checkedLength = 0;
    remoteFiles.forEach(remoteFile => {
      if (file.name == remoteFile.name) {
        _.set(file, "checked", event.target.checked);
      }
      if (minFourDigitsInString(remoteFile.name)) {
        checkedArray.push(remoteFile);
        remoteFile.checked && checkedLength++;
      }
    });
    this.setState({
      remoteFiles,
      checkedAll: checkedLength == checkedArray.length
    });
  };
  //triggers when user clicks on checkall button
  checkedAllFolders = event => {
    let remoteFiles = this.state.remoteFiles;
    let checkedAll = false;
    remoteFiles.map(file => {
      if (minFourDigitsInString(file.name)) {
        _.set(file, "checked", event.target.checked);
        checkedAll = event.target.checked;
      }
    });
    this.setState({ remoteFiles, checkedAll });
  };

  goBack = async appDetails => {
    let { path, remoteDetails } = this.state;
    if (!path || remoteDetails.root_path === path) {
      return;
    }
    //removing the files from path on clicking back folder icon
    let ftp_files_path = [...this.state.ftp_files_path];
    if (!appDetails) {
      ftp_files_path = ftp_files_path.slice(0, -1);
    }
    this.setState({ ftp_files_path });
    path = path.substring(0, path.lastIndexOf("/"));
    this.getContentsOfPath(path);
  };

  getCheckedPaths = () => {
    let remoteFiles = [...this.state.remoteFiles];
    let paths = [];
    let path = this.state.path;
    remoteFiles.forEach((file, index) => {
      if (file.checked) {
        let checkedPath = `${path}/${_.get(file, "name", "")}`;
        checkedPath = _.replace(checkedPath, new RegExp("//", "g"), "/");
        paths.push(checkedPath);
      }
    });
    return paths;
  };

  proceedToUploadSequence = async () => {
    this.showLoading();
    let { selectedCustomer, selectedSubmission } = this.props;
    const res = await ApplicationApi.saveSequenceDetails({
      customer_id: selectedCustomer.id,
      submission_id: selectedSubmission.id,
      additional_details: {
        auth_id: this.state.auth_id,
        sequence_paths: this.getCheckedPaths()
      }
    });
    if (res.data.error) {
      this.setState(
        { selectedFolderError: res.data.message },
        this.hideLoading
      );
      return;
    }
    this.hideLoading();
    if (!res.data.error) {
      Toast.success(res.data.message);
    }
    this.openApplicationsScreen();
  };

  showApplicationDetails = async selectedFolder => {
    this.setState({
      addApplicationinvalidSeq: [],
      invalidSeqError: "",
      selectedFolderError: "",
      showInvalidSeqFooter: false
    });
    let { path, isAddingSequence } = this.state;
    let { selectedCustomer, selectedSubmission } = this.props;
    path = `${path}/${_.get(selectedFolder, "name", "")}`;
    path = _.replace(path, new RegExp("//", "g"), "/");
    // if we are addding sequence, condition passes
    if (isAddingSequence) {
      if (!this.getCheckedPaths().length) {
        return;
      }
      this.showLoading();
      let res = await ApplicationApi.isValidFTPSequenceFolder({
        customer_id: selectedCustomer.id,
        ftp_paths: this.getCheckedPaths(),
        submission_id: selectedSubmission.id
      });
      if (_.get(res, "data.error")) {
        this.setState(
          {
            selectedFolderError: _.get(res, "data.message")
          },
          this.hideLoading
        );
        return;
      }
      //open popup if there are any invalid sequences
      const validSequences = _.get(res, "data.validSequences.length", 0);
      const invalidSequences = _.get(res, "data.inValidSequences.length", 0);
      const addApplicationinvalidSeq = _.get(res, "data.inValidSequences", []);
      if (!validSequences) {
        this.setState({ showInvalidSeqFooter: true });
      }
      if (invalidSequences) {
        this.setState(
          {
            invalidSeqError: "Few sequence folders might have an issue.",
            addApplicationinvalidSeq
          },
          this.hideLoading
        );
        return;
      }
      if (validSequences && !invalidSequences) {
        this.proceedToUploadSequence();
        return;
      }
      if (!_.get(res, "data.isSequence")) {
        this.setState(
          {
            selectedFolderError:
              "Invalid folder. Please select a Sequence folder."
          },
          this.hideLoading
        );
        return;
      }
    }
    this.showLoading();
    // adding submission
    let res = await ApplicationApi.isValidFTPSubmissionFolder({
      customer_id: this.props.selectedCustomer.id,
      ftp_path: path
    });
    let { error, data, message } = res.data;
    if (error) {
      this.setState({ selectedFolderError: message }, this.hideLoading);
      return;
    }
    const { appNumber, appType } = data;
    const validSequences = _.get(data, "validSequences.length", 0);
    const invalidSequences = _.get(data, "invalidSequences.length", 0);
    const addApplicationinvalidSeq = _.get(data, "invalidSequences", []);
    const newState = {
      path,
      appType,
      appNumber,
      validSequences
    };
    if (invalidSequences) {
      newState.invalidSeqError =
        "Few Sequences in the Application folder might have an issue.";
      newState.addApplicationinvalidSeq = addApplicationinvalidSeq;
    }
    if (!validSequences) {
      newState.showInvalidSeqFooter = true;
    }
    this.setState({ ...newState }, () => {
      this.hideLoading();
      if (invalidSequences) {
        return;
      }
      //will trigger submission lookup information if there are no invalid sequences (or) when user wants to proceed to upload valid sequences by skipping the invalid sequences

      if (validSequences || !invalidSequences) {
        this.getSubmissionLookupData();
      }
    });
  };

  getSubmissionLookupData = async () => {
    this.showLoading();
    let res = await ApplicationApi.getSubmissionLookupInfo();
    let { error, data, message } = res.data;
    error = res.data.error;
    if (error) {
      this.setState({ selectedFolderError: message }, this.hideLoading);
      return;
    }
    this.closeInvalidSequenceModal();
    const {
      application_types,
      cloud_types,
      regions,
      submission_centers
    } = data;
    console.log(this.state);
    this.setState(
      {
        selectedFolderError: "",
        invalidSeqError: "",
        showApplicationDetails: true,
        showRemoteFiles: false,
        application_types,
        cloud_types,
        regions,
        submission_centers
      },
      this.hideLoading
    );
  };

  openCustomersScreen = () => {
    this.props.history.push("/customers");
  };

  saveDetails = async obj => {
    obj.customer_id = this.props.selectedCustomer.id;
    obj.cloud_type_id = 1;
    obj.additional_details = {
      auth_id: this.state.auth_id,
      submission_path: this.state.path
    };
    this.showLoading();
    const res = await ApplicationApi.saveSubmissionDetails(obj);
    if (res.data.error) {
      this.setState(
        { selectedFolderError: res.data.message },
        this.hideLoading
      );
      return;
    }
    this.hideLoading();
    if (!res.data.error) {
      Toast.success(res.data.message);
    }
    this.openApplicationsScreen();
  };

  openApplicationsScreen = () => {
    this.setState({ selectedFolderError: "", invalidSeqError: "" });
    this.props.history.push("/applications");
  };

  getTitle = () => {
    if (this.state.showApplicationDetails) {
      return this.state.path;
    }
    if (this.state.selectedCloud) {
      return this.state.selectedCloud;
    }
    return translate("label.newapplication.source");
  };

  getSubtitle = () => {
    if (this.state.showApplicationDetails) {
      return translate("text.newapplication.applicationdetails");
    }
    if (this.state.showRemoteFiles) {
      return translate("text.newapplication.directory");
    }
    if (this.state.selectedCloud) {
      return translate("text.newapplication.serverdetails");
    }
    return translate("text.newapplication.choosesource");
  };

  //go to the specified path on click of the ftp file name on breadcrumb
  goToSpecifiedFtpPath = (file_name, index) => () => {
    let ftp_files_path = [...this.state.ftp_files_path];
    let path = this.state.remoteDetails.ftp_path;
    ftp_files_path = ftp_files_path.slice(0, index + 1);
    let files = ftp_files_path.length ? ftp_files_path.join("/") : "";
    path = `${path}/${files}`;
    this.setState({ ftp_files_path, path });
    this.getContentsOfPath(path);
  };

  //displaying ftp files path
  getFtpFilesPath = () => {
    return (
      <Breadcrumb separator=">">
        {this.state.ftp_files_path.map((path, index) => (
          <Breadcrumb.Item
            onClick={
              index != this.state.ftp_files_path.length - 1 &&
              this.goToSpecifiedFtpPath(path, index)
            }
            className="maindashboard-breadcrum"
            style={{
              ...(index == this.state.ftp_files_path.length - 1 && {
                opacity: 0.4,
                cursor: "not-allowed"
              })
            }}
          >
            {path}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  openInvalidSeqModal = () => {
    if (this.state.openInvalidSequenceModal) {
      return;
    }
    this.setState({ openInvalidSequenceModal: true });
  };

  closeInvalidSequenceModal = () => {
    this.setState({ openInvalidSequenceModal: false });
  };

  showAppDetails = () => {
    if (this.isAddingSequence) {
      this.proceedToUploadSequence();
    }
    this.setState({ proceedToAppDetails: true }, () => {
      this.getSubmissionLookupData();
    });
  };

  render() {
    const { selectedCustomer, selectedSubmission, loading } = this.props;
    const {
      path,
      remoteDetails,
      remoteFiles,
      showClouds,
      enterRemoteDetails,
      showRemoteFiles,
      selectedFolderError,
      invalidSeqError,
      showApplicationDetails,
      regions,
      submission_centers,
      application_types,
      defaultApplicationType,
      defaultApplicationNumber,
      validSequences,
      cloud_types,
      isAddingSequence,
      openInvalidSequenceModal,
      addApplicationinvalidSeq,
      checkedAll,
      showCheckAll,
      showInvalidSeqFooter,
      appNumber,
      appType
    } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addnewapplication">
          <Text
            type="extra_bold"
            size="20px"
            className="addUser-companyname"
            text={
              isAddingSequence
                ? _.get(selectedSubmission, "name", "")
                : _.get(selectedCustomer, "company_name", "")
            }
            onClick={this.openApplicationsScreen}
          />
          <div style={{ marginBottom: "15px" }}>
            <span
              className="maindashboard-breadcrum"
              onClick={this.openCustomersScreen}
            >
              {translate("label.dashboard.customers")}
            </span>
            <span style={{ margin: "0px 5px" }}>></span>
            <span
              className="maindashboard-breadcrum"
              onClick={this.openApplicationsScreen}
            >
              {translate("label.dashboard.applications")}
            </span>
            <span style={{ margin: "0px 5px" }}>></span>
            <span
              className="maindashboard-breadcrum"
              style={{ opacity: 0.4, cursor: "not-allowed" }}
            >
              {translate("label.button.add", {
                type: isAddingSequence
                  ? translate("label.dashboard.sequence")
                  : translate("label.dashboard.application")
              })}
            </span>
          </div>
          <p className="addUser-title" style={{ fontSize: "20px" }}>
            {this.getTitle()}
          </p>
          <p className="addUser-subtitle">{this.getSubtitle()}</p>
          <p>{this.getFtpFilesPath()}</p>
          <div className="global__hr-line" style={{ marginBottom: "20px" }} />
          {selectedFolderError && (
            <Text
              type="regular"
              text={selectedFolderError}
              className="global__text-red"
            />
          )}
          {invalidSeqError && (
            <p className="global__text-red">
              <span>{invalidSeqError}</span>
              <a
                onClick={this.openInvalidSeqModal}
                className="global__cursor-pointer"
              >
                {" "}
                Click here{" "}
              </a>
              <span>to view the details.</span>
            </p>
          )}
          <Modal
            destroyOnClose
            visible={this.state.openInvalidSequenceModal}
            closable={false}
            footer={null}
            width="40%"
          >
            <div
              className="licence-modal__header"
              style={{ marginBottom: "15px" }}
            >
              <Text type="extra_bold" size="16px" text="Invalid Sequences" />
              <img
                src="/images/close.svg"
                className="licence-modal__header-close"
                onClick={this.closeInvalidSequenceModal}
              />
            </div>
            <Table
              columns={columns}
              dataSource={addApplicationinvalidSeq}
              pagination={false}
              scroll={{ y: 250 }}
              className="invalid-sequences-table"
            />
            {!showInvalidSeqFooter ? (
              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <div style={{ textAlign: "left" }}>
                  Do you want to continue to upload the valid sequences by
                  skipping the invalid sequences ?
                </div>
                <div>
                  <OmniButton
                    label="Yes"
                    onClick={this.showAppDetails}
                    buttonStyle={{ width: "80px", marginRight: "12px" }}
                  />
                  <OmniButton
                    label="No"
                    buttonStyle={{ width: "80px", marginRight: "10px" }}
                    onClick={this.closeInvalidSequenceModal}
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <OmniButton
                  label="Close"
                  onClick={this.closeInvalidSequenceModal}
                />
              </div>
            )}
          </Modal>

          <div style={{ marginTop: "20px" }}>
            {showClouds && <ChooseCloud onCloudSelect={this.onCloudSelect} />}
            {enterRemoteDetails && (
              <RemoteDetails
                details={remoteDetails}
                cancel={this.showClouds}
                submit={this.showRemoteFiles}
              />
            )}
            {showRemoteFiles && (
              <RemoteFiles
                isSequence={isAddingSequence}
                currentPath={path}
                rootPath={remoteDetails.ftp_path}
                remoteFiles={remoteFiles}
                cancel={this.enterRemoteDetails}
                openContents={this.getContents}
                goBack={this.goBack}
                submit={this.showApplicationDetails}
                selectFolder={this.checkedFolder}
                selectAll={this.checkedAllFolders}
                checkedAll={checkedAll}
                showCheckAll={showCheckAll}
              />
            )}
            {!isAddingSequence && showApplicationDetails && (
              <ApplicationDetails
                cancel={this.cancelApplicationDetails}
                submit={this.saveDetails}
                regions={_.map(regions, region => ({
                  key: region.id,
                  value: region.name
                }))}
                centers={_.map(submission_centers, center => ({
                  key: center.id,
                  value: center.name
                }))}
                types={_.map(application_types, type => ({
                  key: type.id,
                  value: type.name
                }))}
                validSequences={validSequences}
                appType={{
                  key: _.get(appType, "id"),
                  value: _.get(appType, "name")
                }}
                appNumber={appNumber}
              />
            )}
          </div>
        </ContentLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    selectedCustomer: state.Customer.selectedCustomer,
    selectedSubmission: state.Application.selectedSubmission
  };
}

export default connect(mapStateToProps)(AddNewApplication);
