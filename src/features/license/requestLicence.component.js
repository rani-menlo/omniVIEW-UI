import React, { Component } from "react";
import { connect } from "react-redux";
import { Loader, Text, Row, OmniButton } from "../../uikit/components";
import { LoginActions, ApiActions } from "../../redux/actions";
import { translate } from "../../translations/translator";
import AuthLayout from "../login/authLayout.component";
import { UsermanagementApi } from "../../redux/api";

class RequestLicense extends Component {
  requestLicense = async () => {
    this.props.dispatch(ApiActions.requestOnDemand());
    await UsermanagementApi.requestLicense();
    this.props.dispatch(ApiActions.successOnDemand());
    this.cancel();
  };

  cancel = () => {
    this.props.dispatch(LoginActions.logOut());
    this.props.history.push("/");
  };

  render() {
    return (
      <React.Fragment>
        <Loader loading={this.props.loading} />
        <AuthLayout title={translate("label.licence.request")}>
          <Text type="regular" text={translate("text.licence.request")} />
          <Row style={{ marginTop: "15%" }}>
            <OmniButton
              type="secondary"
              label={translate("label.button.cancel")}
              onClick={this.cancel}
              buttonStyle={{ width: "120px", marginRight: "4px" }}
            />
            <OmniButton
              type="primary"
              label={translate("label.licence.request")}
              onClick={this.requestLicense}
            />
          </Row>
        </AuthLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading
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
)(RequestLicense);
