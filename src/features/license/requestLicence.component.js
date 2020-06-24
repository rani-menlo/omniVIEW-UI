import React, { Component } from "react";
import { connect } from "react-redux";
import { Loader, Text, Row, OmniButton, Toast } from "../../uikit/components";
import { LoginActions, ApiActions, CustomerActions } from "../../redux/actions";
import { translate } from "../../translations/translator";
import AuthLayout from "../login/authLayout.component";
import { UsermanagementApi } from "../../redux/api";

class RequestLicense extends Component {
  requestLicense = async () => {
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await UsermanagementApi.requestLicense({
      customerId: this.props.selectedCustomer.id,
    });
    if (!res.data.error) {
      Toast.success(res.data.message);
      this.props.dispatch(ApiActions.successOnDemand());
      this.cancel();
    } else {
      Toast.error(res.data.message);
      this.props.dispatch(ApiActions.successOnDemand());
      this.cancel();
    }
  };

  cancel = () => {
    if (this.props.customerAccounts.length > 1) {
      this.props.dispatch(CustomerActions.setSelectedCustomer(null));
      this.props.history.push("/customer-accounts");
    } else {
      this.props.dispatch(LoginActions.logOut());
      this.props.history.push("/");
    }
  };

  render() {
    return (
      <React.Fragment>
        <Loader loading={this.props.loading} />
        <AuthLayout
          title={translate("label.licence.request")}
          authLayoutStyle={{ height: "unset" }}
        >
          <Text
            size="14px"
            textStyle={{ marginTop: "5%" }}
            opacity={0.5}
            type="regular"
            text={translate("text.licence.request")}
          />
          <div style={{ marginTop: "10%", textAlign: "right" }}>
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
          </div>
        </AuthLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    selectedCustomer: state.Customer.selectedCustomer,
    customerAccounts: state.Login.customerAccounts,
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
)(RequestLicense);
