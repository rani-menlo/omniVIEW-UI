import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, ContentLayout, Loader, Row } from "../../uikit/components";
import { translate } from "../../translations/translator";
import Subscriptions from "./subscriptions.component";
import Header from "../header/header.component";

class SubscriptionsPage extends Component {
  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    return (
      <React.Fragment>
        <Loader loading={this.props.loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addUser">
          <Text
            type="extra_bold"
            size="20px"
            textStyle={{ textAlign: "center" }}
            className="userManagement-subheader-title"
            text={this.props.selectedCustomer.company_name}
            onClick={this.goBack}
          />
          <Text
            type="extra_bold"
            textStyle={{ marginTop: "20px" }}
            size="24px"
            text={translate("text.licence.subslicencemgmt")}
          />
          <Text
            type="regular"
            size="16px"
            opacity={0.5}
            text={translate("text.licence.viewallpurchased")}
            textStyle={{ marginTop: "10px" }}
          />
          <div className="global__hr-line" style={{ margin: "20px 0px" }} />
          <Subscriptions />
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

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubscriptionsPage);
