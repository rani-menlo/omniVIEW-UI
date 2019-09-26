import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { Loader, ContentLayout, Text } from "../../../uikit/components";
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
      remoteDetails: null,
      remoteFiles: null,
      showRemoteFiles: false,
      selectedFolderError: "",
      showApplicationDetails: false
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
    this.hideLoading();
    let remoteDetails = null;
    if (!res.data.error) {
      remoteDetails = res.data.data;
    }
    this.setState({
      remoteDetails,
      selectedCloud: cloud,
      showClouds: false,
      enterRemoteDetails: true
    });
  };

  showClouds = () => {
    this.setState({
      selectedCloud: "",
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
    this.showLoading();
    ApplicationApi.saveFTPDetails(remoteDetails);
    const res = await ApplicationApi.getContentsOfPath({
      customer_id: this.props.selectedCustomer.id,
      ...(!_.isEmpty(remoteDetails.ftp_path) && {
        ftp_path: remoteDetails.ftp_path
      })
    });
    let remoteFiles = null;
    if (!res.data.error) {
      remoteFiles = res.data.data;
    }
    this.hideLoading();
    this.setState({
      path: remoteDetails.ftp_path,
      remoteDetails,
      remoteFiles,
      showRemoteFiles: true,
      enterRemoteDetails: false,
      showApplicationDetails: false
    });
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
    this.hideLoading();
    this.setState({ remoteFiles, path });
  };

  goBack = async () => {
    const { remoteDetails } = this.state;
    let { path } = this.state;
    if (!path) {
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
    this.hideLoading();
    this.setState({ remoteFiles, path });
  };

  showApplicationDetails = async selectedFolder => {
    let { path } = this.state;
    path = `${path}/${selectedFolder.name}`;
    this.showLoading();
    const res = await ApplicationApi.isValidFTPSubmissionFolder({
      customer_id: this.props.selectedCustomer.id,
      ftpPath: `${this.state.remoteDetails.ftp_path}${path}`
    });
    this.hideLoading();
    if (res.data.error) {
      this.setState({ selectedFolderError: res.data.message });
      return;
    }
    this.setState({
      showApplicationDetails: true,
      showRemoteFiles: false,
      path
    });
  };

  openCustomersScreen = () => {
    this.props.history.push("/customers");
  };

  openApplicationsScreen = () => {
    this.props.history.push("/applications");
  };

  getTitle = () => {
    if (this.state.showApplicationDetails) {
      return `${_.get(this.state.remoteDetails, "ftp_path", "")}${
        this.state.path
      }`;
    }
    if (this.state.selectedCloud) {
      return CLOUDS[this.state.selectedCloud];
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
      selectedCloud,
      remoteDetails,
      remoteFiles,
      showClouds,
      enterRemoteDetails,
      showRemoteFiles,
      selectedFolderError,
      showApplicationDetails,
      path
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
          <p className="addUser-title">{this.getTitle()}</p>
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
                remoteFiles={remoteFiles}
                cancel={this.enterRemoteDetails}
                openContents={this.getContents}
                goBack={this.goBack}
                submit={this.showApplicationDetails}
              />
            )}
            {showApplicationDetails && (
              <ApplicationDetails
                cancel={this.showRemoteFiles}
                submit={this.openApplicationsScreen}
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
