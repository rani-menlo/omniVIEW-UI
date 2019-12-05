import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { Loader, ContentLayout, Text, Toast } from "../../../uikit/components";
import Header from "../../header/header.component";
import ChooseCloud from "./chooseCloud.component";
import RemoteDetails from "./remoteDetails.component";
import RemoteFiles from "./remoteFiles.component";
import ApplicationDetails from "./applicationDetails.component";
import { translate } from "../../../translations/translator";
import { CLOUDS } from "../../../constants";
import { ApplicationApi } from "../../../redux/api";
import { ApiActions } from "../../../redux/actions";

class AddNewApplication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCloud: "",
      showClouds: true,
      enterRemoteDetails: false,
      path: "",
      auth_id: "",
      remoteDetails: null,
      remoteFiles: null,
      showRemoteFiles: false,
      selectedFolderError: "",
      showApplicationDetails: false,
      regions: [],
      submission_centers: [],
      application_types: [],
      cloud_types: [],
      defaultApplicationType: "",
      defaultApplicationNumber: ""
    };
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
      showClouds: true,
      enterRemoteDetails: false
    });
  };

  enterRemoteDetails = () => {
    this.setState({
      showRemoteFiles: false,
      enterRemoteDetails: true,
      selectedFolderError: ""
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
        selectedFolderError: ""
      },
      this.goBack
    );
  };

  getContents = async file => {
    let { path } = this.state;
    path = `${path}/${file.name}`;
    this.showLoading();
    const res = await ApplicationApi.getContentsOfPath({
      customer_id: this.props.selectedCustomer.id,
      ftp_path: path
    });
    let remoteFiles = null;
    if (!res.data.error) {
      remoteFiles = res.data.data;
    }
    this.setState(
      { remoteFiles, path, selectedFolderError: "" },
      this.hideLoading
    );
  };

  goBack = async () => {
    let { path, remoteDetails } = this.state;
    if (!path || remoteDetails.root_path === path) {
      return;
    }
    path = path.substring(0, path.lastIndexOf("/"));
    this.showLoading();
    const res = await ApplicationApi.getContentsOfPath({
      customer_id: this.props.selectedCustomer.id,
      ftp_path: path
    });
    let remoteFiles = null;
    if (!res.data.error) {
      remoteFiles = res.data.data;
    }
    this.setState(
      { remoteFiles, path, selectedFolderError: "" },
      this.hideLoading
    );
  };

  showApplicationDetails = async selectedFolder => {
    let { path } = this.state;
    path = `${path}/${_.get(selectedFolder, "name", "")}`;
    path = _.replace(path, new RegExp("//", "g"), "/");
    this.showLoading();
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
    if (!validSequences) {
      this.setState(
        {
          selectedFolderError:
            "Invalid folder. Please select a Submission folder."
        },
        this.hideLoading
      );
      return;
    }

    res = await ApplicationApi.getSubmissionLookupInfo();
    error = res.data.error;
    if (error) {
      this.setState({ selectedFolderError: message }, this.hideLoading);
      return;
    }

    const {
      application_types,
      cloud_types,
      regions,
      submission_centers
    } = res.data.data;
    this.setState(
      {
        selectedFolderError: "",
        showApplicationDetails: true,
        showRemoteFiles: false,
        path,
        application_types,
        defaultApplicationType: appType,
        defaultApplicationNumber: appNumber,
        cloud_types,
        regions,
        submission_centers,
        validSequences
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
    this.setState({ selectedFolderError: "" });
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

  render() {
    const { selectedCustomer, loading } = this.props;
    const {
      path,
      remoteDetails,
      remoteFiles,
      showClouds,
      enterRemoteDetails,
      showRemoteFiles,
      selectedFolderError,
      showApplicationDetails,
      regions,
      submission_centers,
      application_types,
      defaultApplicationType,
      defaultApplicationNumber,
      validSequences,
      cloud_types
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
            text={_.get(selectedCustomer, "company_name", "")}
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
                type: translate("label.dashboard.application")
              })}
            </span>
          </div>
          <p className="addUser-title" style={{ fontSize: "20px" }}>
            {this.getTitle()}
          </p>
          <p className="addUser-subtitle">{this.getSubtitle()}</p>
          <div className="global__hr-line" style={{ marginBottom: "20px" }} />
          {selectedFolderError && (
            <Text
              type="regular"
              text={selectedFolderError}
              className="global__text-red"
            />
          )}
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
                currentPath={path}
                rootPath={remoteDetails.ftp_path}
                remoteFiles={remoteFiles}
                cancel={this.enterRemoteDetails}
                openContents={this.getContents}
                goBack={this.goBack}
                submit={this.showApplicationDetails}
              />
            )}
            {showApplicationDetails && (
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
                  key: defaultApplicationType.id,
                  value: defaultApplicationType.name
                }}
                appNumber={defaultApplicationNumber}
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
    selectedCustomer: state.Customer.selectedCustomer
  };
}

export default connect(mapStateToProps)(AddNewApplication);
