import React, { Component } from "react";
import { Input, Form, Button } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import { LoginActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import Footer from "../../uikit/components/footer/footer.component";
import { translate } from "../../translations/translator";
import { Text, OmniButton } from "../../uikit/components";
import AuthLayout from "../login/authLayout.component";
import { isEmail } from "../../utils";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      success: false
    };
  }

  componentDidMount() {
    this.props.dispatch(LoginActions.setForgotPwdError(""));
  }

  onInputCode = e => {
    const value = e.target.value;
    if (value.includes(" ")) {
      return;
    }
    this.props.dispatch(LoginActions.setForgotPwdError(""));
    this.setState({ value });
  };

  validate = () => {
    const { value } = this.state;
    if (!value) {
      this.props.dispatch(
        LoginActions.setForgotPwdError(
          translate("error.form.required", {
            type: translate("label.form.email")
          })
        )
      );
    } else if (!isEmail(value)) {
      this.props.dispatch(
        LoginActions.setForgotPwdError(
          translate("error.form.invalid", {
            type: translate("label.form.email")
          })
        )
      );
    } else {
      this.props.dispatch(
        LoginActions.forgotPassword({ email: value }, () => {
          this.setState({ success: true });
        })
      );
    }
  };

  cancel = () => {
    this.props.dispatch(LoginActions.setForgotPwdError(""));
    this.props.history.push("/");
  };

  render() {
    const { loading, error } = this.props;
    const { value, success } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <AuthLayout
          authLayoutStyle={{ height: "280px" }}
          title={translate("label.forgotpwd.forgotpwd")}
          heading={success ? "" : translate("text.forgotpwd.title")}
        >
          {!success && (
            <div>
              <Text
                type="regular"
                text={translate("label.form.email")}
                size="12px"
                opacity={0.5}
              />
              <Form.Item className="authenticationCode-form">
                <Input
                  placeholder={translate("label.form.email")}
                  className={`authenticationCode-form-input ${error &&
                    "authenticationCode-errorbox"}`}
                  onChange={this.onInputCode}
                  value={value}
                />
              </Form.Item>
              {error && (
                <p className="authenticationCode-fieldError">{error}</p>
              )}
              <div className="common_authbuttons">
                <Button
                  className="common_authbuttons-btn common_authbuttons-btn-cancel"
                  onClick={this.cancel}
                >
                  {translate("label.button.cancel")}
                </Button>
                <Button
                  type="primary"
                  className={`common_authbuttons-btn common_authbuttons-btn-send`}
                  onClick={this.validate}
                >
                  {translate("label.button.submit")}
                </Button>
              </div>
            </div>
          )}
          {success && (
            <div
              className="global__center-horiz-vert"
              style={{ flexDirection: "column" }}
            >
              <img src="/images/rite-big.svg" />
              <Text
                type="regular"
                opacity={0.5}
                size="14px"
                text={translate("text.forgotpwd.success")}
                textStyle={{ marginTop: "18px", textAlign: "center" }}
              />
              <OmniButton
                type="primary"
                label={translate("label.button.backtologin")}
                buttonStyle={{ marginTop: "18px", width: "100%" }}
                onClick={this.cancel}
              />
            </div>
          )}
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
    error: state.Login.forgotPwdError
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
)(ForgotPassword);
