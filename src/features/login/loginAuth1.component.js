import React, { Component } from "react";
import { Radio, Button } from "antd";
import { withRouter } from "react-router-dom";

const RadioGroup = Radio.Group;

class LoginAuth1 extends Component {
  sendCode = () => {
    this.props.history.push("/submission");
  };

  render() {
    return (
      <div className="global__container">
        <div className="auth1">
          <p className="auth1-login">Login</p>
          <div className="auth1__text">
            Before we can sign you in, we need to verify you are the account
            owner. Choose to send an authentication code to your email or to
            your phone via SMS.
          </div>
          <RadioGroup>
            <Radio value="email" className="auth1-radio">
              Email Address
            </Radio>
            <Radio value="phone" className="auth1-radio">
              SMS
            </Radio>
          </RadioGroup>
          <div className="auth1__buttons">
            <Button className="auth1__buttons-btn auth1__buttons-btn-cancel">
              Cancel
            </Button>
            <Button
              type="primary"
              className="auth1__buttons-btn auth1__buttons-btn-send"
              onClick={this.sendCode}
            >
              Send Code
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(LoginAuth1);
