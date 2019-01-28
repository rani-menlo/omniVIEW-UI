import React, { Component } from "react";
import { Input, Form, Button, Spin, Icon } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _ from "lodash";
import AuthLayout from "./authLayout.component";
import { LoginActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import Footer from "../../uikit/components/footer/footer.component";

class AuthenticationCode extends Component {
  constructor(props) {
    super(props);
  }
  onInputCode = e => {
    const { verified, error } = this.props;
    error && this.props.actions.resetOtpError();
    verified && this.props.actions.resetOtp();
    const otp = e.target.value;
    if (/\s/.test(otp)) {
      this.props.actions.setOtpError("Invalid Code.");
      return;
    }
    if (_.size(otp) === 5) {
      this.props.actions.verifyOtp({ otp });
    }
  };

  openDashboard = () => {
    this.props.history.push("/customers");
  };

  resendOtp = () => {
    const { mode } = this.props.match.params;
    const data = {
      isEmail: mode === "email"
    };
    this.props.actions.sendOtp(data);
  };

  goBack = () => {
    this.props.actions.setOtpStatus(false);
    this.props.actions.resetOtpError();
    this.props.actions.resetOtp();
    this.props.history.push("/auth");
  };

  getMode = () => {
    const { mode } = this.props.match.params;
    return mode === "email" ? "Email Address" : "Mobile Number";
  };

  render() {
    const { verified, verifying, loading, error } = this.props;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <AuthLayout
          heading={`Enter the five digit code we sent to your registered ${this.getMode()}`}
        >
          <div className="authenticationCode">
            <span className="global__field-label">Authentication Code</span>
            <span className="authenticationCode-send" onClick={this.resendOtp}>
              Send another code
            </span>
          </div>
          <Form.Item className="authenticationCode-form">
            <Input
              disabled={verifying}
              placeholder="code"
              className={`authenticationCode-form-input ${error &&
                "authenticationCode-errorbox"}`}
              onChange={this.onInputCode}
            />
            <div className="authenticationCode-form__icons">
              {verifying && <Spin />}
              {verified &&
                <Icon
                  type="check"
                  className="authenticationCode-form__icons-tick"
                />
              }
            </div>
          </Form.Item>
          {error && <p className="authenticationCode-fieldError">{error}</p>}
          {verified && (
            <span className="authenticationCode-verify">Code Verified</span>
          )}
          <div className="common_authbuttons">
            <Button
              className="common_authbuttons-btn common_authbuttons-btn-cancel"
              onClick={this.goBack}
            >
              Cancel
            </Button>
            <Button
              disabled={!verified}
              type="primary"
              className={`common_authbuttons-btn common_authbuttons-btn-send authenticationCode-login-${
                verified ? "enable" : "disable"
              }`}
              onClick={this.openDashboard}
            >
              Login
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
    verified: state.Login.otp.verified,
    verifying: state.Login.otp.verifying,
    error: state.Login.otp.error
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...LoginActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthenticationCode);
