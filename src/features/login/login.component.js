import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Form, Input, Button, Checkbox } from "antd";
import PropTypes from "prop-types";
import _ from "lodash";
import { LoginActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import Footer from "../../uikit/components/footer/footer.component";
import { translate } from "../../translations/translator";
import { isEmail } from "../../utils";

const FormItem = Form.Item;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: {
        value: "",
        error: "",
      },
      password: {
        value: "",
        error: "",
      },
    };
  }
  static propTypes = {
    form: PropTypes.object,
  };

  componentDidMount() {
    window.addEventListener("load", this.setDocumentTitle);
    window.addEventListener("beforeunload", this.resetErrors);
  }

  componentWillUnmount() {
    window.removeEventListener("load", this.setDocumentTitle);
    window.removeEventListener("beforeunload", this.resetErrors);
  }

  setDocumentTitle = () => {
    window.document.title = translate("label.product.omnicia");
  };

  resetErrors = () => {
    this.props.actions.resetLoginError();
  };

  handleSubmit = (e) => {
    e.preventDefault();
    // this.props.actions.resetLoginError();
    let { email, password } = this.state;
    let email_valid = isEmail(email.value);
    if (!email.value) {
      this.setState({
        email: {
          ...email,
          error: translate("error.form.required", {
            type: translate("label.form.email"),
          }),
        },
      });
    } else if (!password.value) {
      this.setState({
        password: {
          ...password,
          error: translate("error.form.required", {
            type: translate("label.form.password"),
          }),
        },
      });
    } else if (!email_valid) {
      this.setState({
        email: {
          ...email,
          error: translate("error.form.invalid", {
            type: translate("label.form.email"),
          }),
        },
      });
    } else {
      this.props.actions.login({
        username: email.value,
        password: password.value,
      });
    }
  };

  onEmailChange = (e) => {
    this.props.error && this.props.actions.resetLoginError();
    const text = e.target.value;
    let error = "";
    if (/\s/.test(text)) {
      error = translate("error.form.invalid", {
        type: translate("label.form.email"),
      });
    }
    this.setState({
      email: { ...this.state.email, value: text, error },
    });
  };

  onPasswordChange = (e) => {
    this.props.error && this.props.actions.resetLoginError();
    const text = e.target.value;
    this.setState({
      password: { ...this.state.password, value: text, error: "" },
    });
  };

  forgotPwd = () => {
    this.props.history.push("/forgotpwd");
  };

  render() {
    const { loading, error } = this.props;
    const { email, password } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <div className="global__container">
          <div className="login">
            <img src="/images/omnicia-logo.svg" className="login-logo" />
            <p className="login-text">{translate("text.login.title")}</p>
            <div className="login__hr-line global__hr-line" />
            {error && <p className="login-error">{error}</p>}
            <Form onSubmit={this.handleSubmit} autoComplete="new-password">
              <p className="global__field-label">
                {translate("label.form.email")}
              </p>
              <FormItem>
                <Input
                  autoComplete="off"
                  placeholder={translate("label.form.email")}
                  onChange={this.onEmailChange}
                  value={email.value}
                  className={email.error && "login-errorbox"}
                />
              </FormItem>
              {email.error && <p className="login-fieldError">{email.error}</p>}
              <div className="login__pwdsection" onClick={this.forgotPwd}>
                <span className="global__field-label">
                  {translate("label.form.password")}
                </span>
                <a className="login__pwdsection-forgot-pwd" tabIndex="3">
                  {translate("text.login.forgotpwd")}
                </a>
              </div>
              <FormItem>
                <Input
                  type="password"
                  placeholder={translate("label.form.password")}
                  value={password.value}
                  onChange={this.onPasswordChange}
                  className={password.error && "login-errorbox"}
                />
              </FormItem>
              {password.error && (
                <p className="login-fieldError">{password.error}</p>
              )}
              <Checkbox disabled className="login-rememberpwd">
                {translate("text.login.rememberpwd")}
              </Checkbox>
              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  {translate("label.login.signin")}
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
        <Footer alignToBottom />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    error: state.Login.login.error || state.Login.login.logoutMsg,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...LoginActions }, dispatch),
  };
}

const LoginForm = Form.create()(Login);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(LoginForm));
