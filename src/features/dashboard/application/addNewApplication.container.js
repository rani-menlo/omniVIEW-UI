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
      ftp_files_path: ["root"],
      auth_id: "",
      remoteDetails: null,
      remoteFiles: null,
      showRemoteFiles: false,
      selectedFolderError: "",
      invalidSeqError: "",
      showApplicationDetails: false,
      regions: [],
      selectedRegion: "",
      submission_centers: [],
      application_types: [],
      cloud_types: [],
      isAddingSequence: false,
      openInvalidSequenceModal: false,
      addApplicationinvalidSeq: [],
      validSequencesArray: [],
      proceedToAppDetails: false,
      checkedAll: false,
      showCheckAll: false,
      showInvalidSeqFooter: false,
      selectedFolderPath: ""
    };
  }

  componentDidMount() {
    const isAddingSequence = this.props.history.location.pathname.endsWith(
      "/sequences/add"
    );
    this.setState({ isAddingSequence });
  }
  /**
   * Showing the loaders
   */
  showLoading = () => {
    this.props.dispatch(ApiActions.requestOnDemand());
  };
  /**
   * Hiding the loaders
   */
  hideLoading = () => {
    this.props.dispatch(ApiActions.successOnDemand());
  };

  //if the source type is AFS/site-to-site vpm connection
  getEachCustomerAFSFolders = async cloud => {
    let remoteDetails = {};
    _.set(remoteDetails, "ftp_path", `/${this.props.selectedCustomer.id}`);
    this.showLoading();
    const res = await ApplicationApi.getCustomerAfsFolders({
      customer_id: this.props.selectedCustomer.id
    });
    let remoteFiles = null;
    if (!res.data.error) {
      remoteFiles = res.data.data;
    }
    this.setState(
      {
        selectedCloud: cloud.name,
        showClouds: false,
        remoteDetails,
        path: remoteDetails.ftp_path,
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
  };
  /**
   * @param {*} cloud
   * on selecting the source to transfer the files
   */
  onCloudSelect = async cloud => {
    if (cloud.name == "AFS") {
      this.getEachCustomerAFSFolders(cloud);
      return;
    }
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
      enterRemoteDetails: false,
      showRemoteFiles: false
    });
  };

  enterRemoteDetails = () => {
    this.setState({
      showRemoteFiles: false,
      enterRemoteDetails: true,
      selectedFolderError: "",
      invalidSeqError: "",
      ftp_files_path: []
    });
  };
  /**
   * @param {*} remoteDetails 
   * Showing the ftp details
   */
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
        this.state.selectedCloud == "AFS"
          ? this.getEachCustomerAFSFolders({ name: this.state.selectedCloud })
          : this.goBack(true);
      }
    );
  };
  /**
   * @param {*} path 
   * Displaying the files inside the ftp path
   */
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
  /**
   * @param {*} appDetails 
   * Moving back to the previus screen
   */
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
  /**
   * Uploading sequences when the submission has valid sequences
   */
  proceedToUploadSequence = async () => {
    this.showLoading();
    let { selectedCustomer, selectedSubmission } = this.props;
    const validSequencesArray = this.state.validSequencesArray;
    const res = await ApplicationApi.saveSequenceDetails({
      customer_id: selectedCustomer.id,
      submission_id: selectedSubmission.id,
      additional_details: {
        auth_id: this.state.auth_id,
        sequence_paths: validSequencesArray
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
  /**
   * Displaying the application details in the application details screen
   * If the submission has valid sequences
   * @param {*} selectedFolder 
   */
  showApplicationDetails = async selectedFolder => {
    this.setState({
      addApplicationinvalidSeq: [],
      validSequencesArray: [],
      invalidSeqError: "",
      selectedFolderError: "",
      showInvalidSeqFooter: false
    });

    let { path, isAddingSequence, selectedFolderPath } = this.state;
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
      const validSequencesArray = _.get(res, "data.validSequences", []);
      const invalidSequences = _.get(res, "data.inValidSequences.length", 0);
      const addApplicationinvalidSeq = _.get(res, "data.inValidSequences", []);
      if (!validSequences) {
        this.setState({ showInvalidSeqFooter: true });
      } else {
        this.setState({ validSequencesArray: validSequencesArray });
      }
      if (invalidSequences) {
        this.setState(
          {
            invalidSeqError: "An issue occurred during upload.",
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
    if (!selectedFolder) {
      return;
    }
    this.showLoading();
    let res = null;
    // adding submission
    //As per the ticket OMNG-722 - Implement submission validations for AFS type cloud
    if (this.state.selectedCloud == "AFS") {
      res = await ApplicationApi.isValidAFSSubmissionFolder({
        customer_id: this.props.selectedCustomer.id,
        ...(!_.isEmpty(path) && {
          afs_path: path
        })
      });
    } else {
      //Implement submission validations for FTP cloud
      res = await ApplicationApi.isValidFTPSubmissionFolder({
        customer_id: this.props.selectedCustomer.id,
        ftp_path: path
      });
    }
    selectedFolderPath = path;
    let { error, data, message } = res.data;
    if (message == "Invalid folder. Please select a Submission folder.") {
      message =
        "Invalid Application folder. Please select an Application folder that has at least one valid Sequence to upload.";
    }
    if (error) {
      this.setState({ selectedFolderError: message }, this.hideLoading);
      return;
    }
    const { appNumber, appType, regions } = data;
    const selectedRegion = regions;
    const validSequences = _.get(data, "validSequences.length", 0);
    const validSequencesArray = _.get(data, "validSequences", []);
    const invalidSequences = _.get(data, "invalidSequences.length", 0);
    const addApplicationinvalidSeq = _.get(data, "invalidSequences", []);
    //we are removing the last selectedFolder from path once we get the response
    path = path.substring(0, path.lastIndexOf("/"));
    const newState = {
      selectedFolderPath,
      path,
      appType,
      selectedRegion,
      appNumber,
      regions,
      validSequences
    };

    if (invalidSequences) {
      newState.invalidSeqError = "An issue occurred during upload.";
      newState.addApplicationinvalidSeq = addApplicationinvalidSeq;
    }
    if (invalidSequences && !validSequences) {
      newState.invalidSeqError = "";
      newState.selectedFolderError =
        "Invalid Application folder. Please select an Application folder that has at least one valid Sequence to upload.";
    }
    if (!validSequences) {
      newState.showInvalidSeqFooter = true;
    }
    if (validSequencesArray) {
      newState.validSequencesArray = validSequencesArray;
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
  /**
   * To get the submission lookup data in the application details screen
   */
  getSubmissionLookupData = async () => {
    let path = this.state.selectedFolderPath;
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
        submission_centers,
        path
      },
      this.hideLoading
    );
  };
  /**
   * Redirecting to the customers screen
   */
  openCustomersScreen = () => {
    this.props.history.push("/customers");
  };
  /**
   * Saving the uploaded submission/sequence details
   * @param {*} obj 
   */
  saveDetails = async obj => {
    obj.customer_id = this.props.selectedCustomer.id;
    //we need to remove cloud_type_id for cloud type AFS later
    obj.cloud_type_id = 1;
    if (this.state.selectedCloud == "AFS") {
      obj.additional_details = {
        submission_path: this.state.selectedFolderPath
      };
    } else {
      obj.additional_details = {
        auth_id: this.state.auth_id,
        submission_path: this.state.selectedFolderPath
      };
    }
    this.showLoading();
    const res =
      this.state.selectedCloud == "AFS"
        ? await ApplicationApi.saveAfsSubmissionDetails(obj)
        : await ApplicationApi.saveSubmissionDetails(obj);
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
  /**
   * Redirect to the applications screen
   */
  openApplicationsScreen = () => {
    this.setState({ selectedFolderError: "", invalidSeqError: "" });
    this.props.history.push("/applications");
  };
  /**
   * Displaying add new application title
   */
  getTitle = () => {
    if (this.state.showApplicationDetails) {
      return this.state.path;
    }
    if (this.state.selectedCloud) {
      return this.state.selectedCloud;
    }
    return translate("label.newapplication.source");
  };
  /**
   * Displaying the application details text and the current path
   */
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
    //If user clicks on root
    if (file_name == "root" && index == 0) {
      let ftp_files_path = [...this.state.ftp_files_path];
      ftp_files_path = ["root"];
      let path = `${this.state.remoteDetails.ftp_path}`;
      this.setState({ ftp_files_path, path }, () => {
        this.getContentsOfPath(path);
      });
      return;
    }
    let ftp_files_path = [...this.state.ftp_files_path];
    let path = this.state.remoteDetails.ftp_path;
    ftp_files_path = ftp_files_path.slice(0, index + 1);
    ftp_files_path = _.tail(ftp_files_path);
    let files = ftp_files_path.length ? ftp_files_path.join("/") : "";
    path = `${path}/${files}`;
    ftp_files_path = ["root", ...ftp_files_path];
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
  /**
   * When user clicks on Refresh icon
   */
  getResfreshedFiles = () => {
    if (this.state.selectedCloud == "AFS") {
      this.getEachCustomerAFSFolders({ name: this.state.selectedCloud });
      return;
    }
    let { path } = this.state;
    this.getContentsOfPath(path);
  };
  /**
   * Open the modal containing invalid sequences for the uploaded submission
   */
  openInvalidSeqModal = () => {
    if (this.state.openInvalidSequenceModal) {
      return;
    }
    this.setState({ openInvalidSequenceModal: true });
  };
  /**
   * Closing the invalid sequences modal
   */
  closeInvalidSequenceModal = () => {
    this.setState({ openInvalidSequenceModal: false });
  };
  /**Showing the application details lookup data */
  showAppDetails = () => {
    if (this.state.isAddingSequence) {
      this.proceedToUploadSequence();
      return;
    }
    this.setState({ proceedToAppDetails: true }, () => {
      this.getSubmissionLookupData();
    });
  };

  render() {
    const { selectedCustomer, selectedSubmission, loading, role } = this.props;
    const {
      path,
      remoteDetails,
      remoteFiles,
      selectedCloud,
      showClouds,
      enterRemoteDetails,
      showRemoteFiles,
      selectedFolderError,
      invalidSeqError,
      showApplicationDetails,
      regions,
      submission_centers,
      application_types,
      validSequences,
      isAddingSequence,
      addApplicationinvalidSeq,
      checkedAll,
      showCheckAll,
      showInvalidSeqFooter,
      appNumber,
      appType,
      selectedRegion
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
          {!showApplicationDetails &&
            showRemoteFiles &&
            selectedCloud != "AFS" && (
              <p
                style={{
                  display: "inline-block",
                  maxWidth: "650px",
                  wordBreak: "break-all"
                }}
              >
                {this.getFtpFilesPath()}
              </p>
            )}
          {!showApplicationDetails && showRemoteFiles && (
            <div
              onClick={this.getResfreshedFiles}
              className={`refresh ${
                selectedCloud == "AFS" ? "afs" : "non-afs"
              }`}
              title="Refresh"
            >
              <img
                src="/images/refresh.png"
                style={{ width: "22px", height: "22px" }}
              />
            </div>
          )}
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
              <span>for details.</span>
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
            {showClouds && (
              <ChooseCloud onCloudSelect={this.onCloudSelect} role={role} />
            )}
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
                cancel={
                  selectedCloud == "AFS"
                    ? this.showClouds
                    : this.enterRemoteDetails
                }
                openContents={this.getContents}
                goBack={this.goBack}
                submit={this.showApplicationDetails}
                selectFolder={this.checkedFolder}
                selectAll={this.checkedAllFolders}
                checkedAll={checkedAll}
                showCheckAll={showCheckAll}
                cloud={selectedCloud}
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
                selectedRegion={{
                  key: _.get(selectedRegion, "id"),
                  value: _.get(selectedRegion, "name")
                }}
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
    selectedSubmission: state.Application.selectedSubmission,
    role: state.Login.role
  };
}

export default connect(mapStateToProps)(AddNewApplication);
