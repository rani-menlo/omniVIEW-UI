import React, { Component } from "react";
import { connect } from "react-redux";
import API from "../../redux/api";
import { ApiActions } from "../../redux/actions";
import { URI } from "../../constants";
import _ from "lodash";
import Header from "../header/header.component";
import { translate } from "../../translations/translator";
import Split from "react-split";
import SplitterLayout from "react-splitter-layout";

import {
  Text,
  OmniButton,
  Loader,
  ContentLayout,
  InputField
} from "../../uikit/components";
import { isValidPwd } from "../../utils";
import { LoginActions } from "../../redux/actions";

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: {
        value: "",
        error: ""
      },
      confirmPwd: {
        value: "",
        error: ""
      },
      expired: false
    };
  }

  async componentDidMount() {
    const { params } = this.props.match;
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await API.post(URI.RESET_PWD_LINK_EXPIRY, {
      password: params.key
    });
    this.props.dispatch(ApiActions.successOnDemand());
    if (res.data.expired) {
      this.setState({ expired: true });
    }
  }

  onInputChange = field => e => {
    const { value } = e.target;
    this.setState({
      [field]: { ...this.state[field], value, error: "" }
    });
  };

  goToLogin = () => {
    this.props.history.push("/");
  };

  submit = () => {
    const state = { ...this.state };
    if (state.expired) {
      this.props.history.push("/forgotpwd");
      return;
    }
    let error = false;
    if (!state.password.value) {
      error = true;
      state.password.error = translate("error.form.required", {
        type: `${translate("label.generic.new")} ${translate(
          "label.form.password"
        )}`
      });
    }
    if (state.password.value) {
      const valid = isValidPwd(state.password.value);
      if (valid) {
        if (!state.confirmPwd.value) {
          error = true;
          state.confirmPwd.error = translate("error.form.required", {
            type: translate("label.form.password")
          });
        }
        if (state.password.value !== state.confirmPwd.value) {
          error = true;
          state.confirmPwd.error = translate("error.form.pwdmismatch");
        }
      } else {
        error = true;
        state.password.error = translate("error.form.pwdreq");
      }
    }

    if (error) {
      this.setState(state);
      return;
    }
    const { params } = this.props.match;
    this.props.dispatch(
      LoginActions.resetPassword(
        {
          key: params.key,
          password: state.password.value,
          confirmPassword: state.confirmPwd.value
        },
        () => {
          this.goToLogin();
        }
      )
    );
  };

  render() {
    const { password, confirmPwd, expired } = this.state;
    return (
      <React.Fragment>
        <Loader loading={this.props.loading} />
        <Header style={{ marginBottom: "0px", justifyContent: "center" }} />
        <ContentLayout
          className="resetpassword"
          childStyle={expired && { paddingRight: "10%" }}
        >
          {!expired && (
            <React.Fragment>
              <div style={{ marginBottom: "15px" }}>
                <Text
                  type="extra_bold"
                  size="24px"
                  text={translate("label.forgotpwd.createnew")}
                />
                <Text
                  type="regular"
                  opacity={0.5}
                  size="14px"
                  text={translate("text.form.pwdreq")}
                />
                <div
                  className="global__hr-line"
                  style={{ margin: "15px 0px" }}
                />
              </div>
              <InputField
                type="password"
                className="resetpassword-field"
                style={{ marginRight: "14px" }}
                label={`${translate("label.generic.new")} ${translate(
                  "label.form.password"
                )}`}
                value={password.value}
                placeholder={`${translate("label.generic.new")} ${translate(
                  "label.form.password"
                )}`}
                error={password.error}
                onChange={this.onInputChange("password")}
              />
              <InputField
                type="password"
                className="resetpassword-field"
                label={`${translate("label.generic.new")} ${translate(
                  "label.form.password"
                )} ${translate("label.generic.again")}`}
                value={confirmPwd.value}
                placeholder={`${translate("label.generic.new")} ${translate(
                  "label.form.password"
                )} ${translate("label.generic.again")}`}
                error={confirmPwd.error}
                onChange={this.onInputChange("confirmPwd")}
              />
            </React.Fragment>
          )}
          {expired && (
            <div
              className="global__center-vert"
              style={{ flexDirection: "column" }}
            >
              <img
                src="/images/alert-low.svg"
                style={{ width: "40px", height: "40px" }}
              />
              <Text
                type="bold"
                size="16px"
                textStyle={{ marginTop: "12px" }}
                text={translate("text.forgotpwd.linkexpired")}
              />
            </div>
          )}
          <div
            className={`resetpassword__buttons ${expired &&
              "global__center-horiz-vert"}`}
          >
            <OmniButton
              className="resetpassword__buttons-btn"
              type="secondary"
              label={
                expired
                  ? translate("label.button.backtologin")
                  : translate("label.button.cancel")
              }
              onClick={this.goToLogin}
            />
            <OmniButton
              type="primary"
              className="resetpassword__buttons-btn"
              label={
                expired
                  ? translate("label.forgotpwd.forgotpwd")
                  : translate("label.button.submit")
              }
              buttonStyle={{ marginLeft: "16px" }}
              onClick={this.submit}
            />
          </div>
        </ContentLayout>
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
)(ResetPassword);
