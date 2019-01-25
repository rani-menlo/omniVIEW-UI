import React, { Component } from 'react';
import { Radio, Button } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import AuthLayout from './authLayout.component';
import { LoginActions } from '../../redux/actions';
import Loader from '../../uikit/components/loader';
import Footer from '../../uikit/components/footer/footer.component';

const RadioGroup = Radio.Group;

class LoginAuth1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 'email'
    };
  }
  sendCode = () => {
    const data = {
      isEmail: this.state.selected === 'email'
    };
    this.props.actions.sendOtp(data);
  };

  goBack = () => {
    this.props.actions.setLoggedInStatus(false);
    this.props.history.push('/');
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
        <AuthLayout
          heading="Before we can sign you in, we need to verify you are the account
      owner. Choose to send an authentication code to your email or to your
      phone via SMS."
        >
          <RadioGroup onChange={this.onSelect} value={this.state.selected}>
            <Radio value="email" className="auth1-radio">
              Email Address
            </Radio>
            <Radio value="phone" className="auth1-radio">
              SMS
            </Radio>
          </RadioGroup>
          {/* <form>
          <input type="radio" name="gender" value="male" checked />
          <input type="radio" name="gender" value="female" checked />
        </form> */}
          <div className="common_authbuttons">
            <Button
              className="common_authbuttons-btn common_authbuttons-btn-cancel"
              onClick={this.goBack}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="common_authbuttons-btn common_authbuttons-btn-send"
              onClick={this.sendCode}
            >
              Send Code
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
    otpReceived: state.Login.otp.otpReceived
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
)(LoginAuth1);
