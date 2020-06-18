import React, { Component } from "react";
import { Input, Form, Button, Spin, Icon } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _ from "lodash";
import AuthLayout from "./authLayout.component";
import { LoginActions, CustomerActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import Footer from "../../uikit/components/footer/footer.component";
import { translate } from "../../translations/translator";
import { isLoggedInOmniciaRole } from "../../utils";

class AuthenticationCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: "",
    };
  }
  onInputCode = (e) => {
    const { verified, error } = this.props;
    error && this.props.actions.resetOtpError();
    verified && this.props.actions.resetOtp();
    const otp = e.target.value;
    this.setState({ otp });
    if (/\s/.test(otp)) {
      this.props.actions.setOtpError(translate("error.authcode.invalid"));
      return;
    }
    if (_.size(otp) === 5) {
      this.props.actions.verifyOtp({ otp });
    }
  };

  openDashboard = () => {
    const { user, invalid_license, customerAccounts } = this.props;
    if (invalid_license) {
      this.props.history.push("/requestlicense");
      return;
    }
    this.props.actions.authenticated();

    if (user.first_login) {
      this.props.history.push("/profile");
      return;
    }
    if (customerAccounts && customerAccounts.length > 1) {
      this.props.history.push("/customer-accounts");
    } else {
      let obj = {
        customerId: _.get(customerAccounts[0].customer, "id"),
      };
      this.props.actions.switchCustomerAccounts(obj, () => {
        if (isLoggedInOmniciaRole(customerAccounts[0].role)) {
          this.props.history.push("/customers");
          return;
        }
        this.props.dispatch(
          CustomerActions.setSelectedCustomer(customerAccounts[0].customer)
        );
        this.props.history.push("/applications");
      });
    }
  };

  resendOtp = () => {
    const { mode } = this.props.match.params;
    this.props.actions.resetOtpError();
    this.props.actions.resetOtp();
    const data = {
      isEmail: mode === "email",
    };
    this.props.actions.sendOtp(data);
    this.setState({ otp: "" });
  };

  goBack = () => {
    this.props.actions.setOtpStatus(false);
    this.props.actions.resetOtpError();
    this.props.actions.resetOtp();
    this.props.history.push("/auth");
  };

  getMode = () => {
    const { mode } = this.props.match.params;
    return mode === "email"
      ? translate("label.form.email")
      : translate("label.form.phone");
  };

  render() {
    const { verified, verifying, loading, error } = this.props;
    const { otp } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <AuthLayout
          heading={translate("text.authcode.title", { type: this.getMode() })}
        >
          <div className="authenticationCode">
            <span className="global__field-label">
              {translate("label.authcode.authentication")}
            </span>
            <span className="authenticationCode-send" onClick={this.resendOtp}>
              {translate("label.authcode.sendother")}
            </span>
          </div>
          <Form.Item className="authenticationCode-form">
            <Input
              disabled={verifying}
              placeholder={translate("placeholder.authcode.code")}
              className={`authenticationCode-form-input ${error &&
                "authenticationCode-errorbox"}`}
              onChange={this.onInputCode}
              value={otp}
            />
            <div className="authenticationCode-form__icons">
              {verifying && <Spin />}
              {verified && (
                <Icon
                  type="check"
                  className="authenticationCode-form__icons-tick"
                />
              )}
            </div>
          </Form.Item>
          {error && <p className="authenticationCode-fieldError">{error}</p>}
          {verified && (
            <span className="authenticationCode-verify">
              {translate("text.authcode.verified")}
            </span>
          )}
          <div className="common_authbuttons">
            <Button
              className="common_authbuttons-btn common_authbuttons-btn-cancel"
              onClick={this.goBack}
            >
              {translate("label.button.cancel")}
            </Button>
            <Button
              disabled={!verified}
              type="primary"
              className={`common_authbuttons-btn common_authbuttons-btn-send authenticationCode-login-${
                verified ? "enable" : "disable"
              }`}
              onClick={this.openDashboard}
            >
              {translate("text.login.title")}
            </Button>
          </div>
        </AuthLayout>
        <Footer alignToBottom />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    user: state.Login.user,
    verified: state.Login.otp.verified,
    verifying: state.Login.otp.verifying,
    invalid_license: state.Login.otp.invalid_license,
    error: state.Login.otp.error,
    customerAccounts: state.Login.customerAccounts,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators({ ...LoginActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthenticationCode);
