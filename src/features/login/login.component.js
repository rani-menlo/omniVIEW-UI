import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Form, Input, Button, Checkbox, message as MessageBox } from "antd";
import PropTypes from "prop-types";
import OmniciaLogo from "../../../assets/images/omnicia-logo.svg";
import _ from "lodash";
import { LoginActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";

const FormItem = Form.Item;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
  }
  static propTypes = {
    form: PropTypes.object
  };

  handleSubmit = e => {
    e.preventDefault();
    let { username, password } = this.state;
    username = username.trim();
    password = password.trim();
    if (!username) {
      MessageBox.error("Invalid username");
    } else if (!password) {
      MessageBox.error("Invalid password");
    } else {
      this.props.actions.login({ username, password });
    }
  };

  onUsernameChange = e => {
    this.setState({ username: e.target.value });
  };

  onPasswordChange = e => {
    this.setState({ password: e.target.value });
  };

  render() {
    const { loading } = this.props;
    const { username, password } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <div className="global__container">
          <div className="login">
            <img src={OmniciaLogo} className="login-logo" />
            <p className="login-text">Login</p>
            <div className="login__hr-line global__hr-line" />
            <Form onSubmit={this.handleSubmit}>
              <p className="global__field-label">Username</p>
              <FormItem>
                <Input
                  placeholder="Username"
                  onChange={this.onUsernameChange}
                  value={username}
                />
              </FormItem>
              <div className="login__pwdsection">
                <span className="global__field-label">Password</span>
                <a className="login__pwdsection-forgot-pwd" href="">
                  Forgot your password?
                </a>
              </div>
              <FormItem>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={this.onPasswordChange}
                />
              </FormItem>
              <Checkbox className="login-rememberpwd">
                Remember Password?
              </Checkbox>
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
    actions: bindActionCreators({ ...LoginActions }, dispatch)
  };
}

const LoginForm = Form.create()(Login);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginForm);
