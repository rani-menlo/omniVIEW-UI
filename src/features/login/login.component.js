import React, { Component } from "react";
import { Form, Input, Button, Checkbox } from "antd";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import OmniciaLogo from "../../../assets/images/omnicia-logo.svg";
import _ from "lodash";

const FormItem = Form.Item;

class Login extends Component {
  static propTypes = {
    form: PropTypes.object
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.history.push("/auth1");
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="global__container">
        <div className="login">
          <img src={OmniciaLogo} className="login-logo" />
          <p className="login-text">Login</p>
          <div className="login__hr-line" />
          <Form onSubmit={this.handleSubmit}>
            <p className="global__field-label">Username</p>
            <FormItem>
              {getFieldDecorator("userName", {
                rules: [
                  { required: true, message: "Please input your username!" }
                ]
              })(<Input placeholder="Username" />)}
            </FormItem>
            <div style={{ marginBottom: "4px" }}>
              <span className="global__field-label">Password</span>
              <a className="login-forgot-pwd" href="">
                Forgot your password?
              </a>
            </div>
            <FormItem>
              {getFieldDecorator("password", {
                rules: [
                  { required: true, message: "Please input your Password!" }
                ]
              })(<Input type="password" placeholder="Password" />)}
            </FormItem>
            <Checkbox>Remember Password?</Checkbox>
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Sign in
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

const WrappedLoginForm = withRouter(Form.create()(Login));

export default WrappedLoginForm;
