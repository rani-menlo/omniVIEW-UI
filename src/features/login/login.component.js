import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Input, Button, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import OmniciaLogo from '../../../public/images/omnicia-logo.svg';
import _ from 'lodash';
import { LoginActions } from '../../redux/actions';
import Loader from '../../uikit/components/loader';

const FormItem = Form.Item;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: {
        value: '',
        error: ''
      },
      password: {
        value: '',
        error: ''
      }
    };
  }
  static propTypes = {
    form: PropTypes.object
  };

  handleSubmit = e => {
    e.preventDefault();
    let { username, password } = this.state;
    if (!username.value) {
      this.setState({
        username: { ...username, error: 'Username is required' }
      });
    } else if (!password.value) {
      this.setState({
        password: { ...password, error: 'Password is required' }
      });
    } else {
      this.props.actions.login({
        username: username.value,
        password: password.value
      });
    }
  };

  onUsernameChange = e => {
    this.props.error && this.props.actions.resetLoginError();
    const text = e.target.value;
    let error = '';
    if (/\s/.test(text)) {
      error = 'Inavlid Username';
    }
    this.setState({
      username: { ...this.state.username, value: text, error }
    });
  };

  onPasswordChange = e => {
    this.props.error && this.props.actions.resetLoginError();
    const text = e.target.value;
    this.setState({
      password: { ...this.state.password, value: text, error: '' }
    });
  };

  render() {
    const { loading, error } = this.props;
    const { username, password } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <div className="global__container">
          <div className="login">
            <img src={OmniciaLogo} className="login-logo" />
            <p className="login-text">Login</p>
            <div className="login__hr-line global__hr-line" />
            {error && <p className="login-error">{error}</p>}
            <Form onSubmit={this.handleSubmit}>
              <p className="global__field-label">Username</p>
              <FormItem>
                <Input
                  placeholder="Username"
                  onChange={this.onUsernameChange}
                  value={username.value}
                  className={username.error && 'login-errorbox'}
                />
              </FormItem>
              {username.error && (
                <p className="login-fieldError">{username.error}</p>
              )}
              <div className="login__pwdsection">
                <span className="global__field-label">Password</span>
                <a
                  className="login__pwdsection-forgot-pwd"
                  href=""
                  tabIndex="3"
                >
                  Forgot your password?
                </a>
              </div>
              <FormItem>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password.value}
                  onChange={this.onPasswordChange}
                  className={password.error && 'login-errorbox'}
                />
              </FormItem>
              {password.error && (
                <p className="login-fieldError">{password.error}</p>
              )}
              <Checkbox className="login-rememberpwd">
                Remember Password?
              </Checkbox>
              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  Sign In
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
    loading: state.Api.loading,
    error: state.Login.login.error
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
