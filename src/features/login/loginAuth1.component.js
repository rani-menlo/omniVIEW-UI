import React, { Component } from "react";
import _ from 'lodash';
import { Radio, Button } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Redirect } from "react-router-dom";
import AuthLayout from "./authLayout.component";
import { LoginActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import Footer from "../../uikit/components/footer/footer.component";
import { translate } from "../../translations/translator";

const RadioGroup = Radio.Group;

class LoginAuth1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: "email"
    };
  }
  sendCode = () => {
    const data = {
      isEmail: this.state.selected === "email"
    };
    this.props.actions.sendOtp(data);
  };

  goBack = () => {
    this.props.dispatch(LoginActions.logOut());
    this.props.actions.setLoggedInStatus(false);
    this.props.history.push("/");
  };

  onSelect = e => {
    this.setState({ selected: e.target.value });
  };

  render() {
    const { loading, otpReceived } = this.props;
    return otpReceived ? (
      <Redirect to={`/verify/${this.state.selected}`} />
    ) : (
      <React.Fragment>
        <Loader loading={loading} />
        <AuthLayout heading={translate("text.loginauth.title")}>
          <RadioGroup onChange={this.onSelect} value={this.state.selected}>
            <Radio value="email" className="global__radio">
              {translate("label.form.email")}
            </Radio>
            <Radio value="phone" className="global__radio">
              {translate("label.loginauth.sms")}
            </Radio>
          </RadioGroup>
          <div className="common_authbuttons">
            <Button
              className="common_authbuttons-btn common_authbuttons-btn-cancel"
              onClick={this.goBack}
            >
              {translate("label.button.cancel")}
            </Button>
            <Button
              type="primary"
              className="common_authbuttons-btn common_authbuttons-btn-send"
              onClick={this.sendCode}
            >
              {translate("label.loginauth.sendcode")}
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
    otpReceived: _.get(state, "Login.otp.otpReceived")
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...LoginActions }, dispatch),
    dispatch
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginAuth1);
