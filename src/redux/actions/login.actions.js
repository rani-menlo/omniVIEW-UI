import _ from "lodash";
import { LoginActionTypes } from "../actionTypes";
import { ApiActions, LoginActions } from ".";
import { LoginApi } from "../api";
import { Toast } from "../../uikit/components";

export default {
  login: (data) => {
    return async (dispatch) => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.login(data);
        dispatch({
          type: LoginActionTypes.LOGIN,
          data: res.data,
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchCustomerAccounts: () => {
    return async (dispatch) => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.fetchCustomerAccounts();
        dispatch({
          type: LoginActionTypes.FETCH_CUSTOMER_ACCOUNTS,
          data: res.data,
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  switchCustomerAccounts: (customerId, cb) => {
    return async (dispatch) => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.switchAccountByCustomerUserId(customerId);
        if (!_.get(res, "data.invalid_license")) {
          localStorage.setItem(
            "omniview_user_token",
            _.get(res.data.data, "token", "")
          );
        }
        dispatch({
          type: LoginActionTypes.SWITCH_ACCOUNT,
          data: res.data,
        });
        ApiActions.success(dispatch);
        cb && cb();
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  createOrUpdateProfile: (data, history, cb) => {
    return async (dispatch) => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.createOrUpdateProfile(data);
        dispatch({
          type: LoginActionTypes.CREATE_UPDATE_PROFILE,
          data: res.data,
        });
        if (!res.data.error) {
          // Toast.success("Profile Updated!");
          // history.push("/customer-accounts");
        }
        ApiActions.success(dispatch);
        cb && cb();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  checkForUsername: (data, callback) => {
    return async (dispatch) => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.checkForUsername(data);
        dispatch({
          type: LoginActionTypes.CHECK_USERNAME,
          data: res.data,
        });
        ApiActions.success(dispatch);
        !res.data.error && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },

  sendOtp: (data) => {
    return async (dispatch) => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.sendOtp(data);
        dispatch({
          type: LoginActionTypes.SEND_OTP,
          data: res.data,
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  verifyOtp: (data) => {
    return async (dispatch) => {
      try {
        dispatch({
          type: LoginActionTypes.VERIFY_OTP,
        });
        const res = await LoginApi.verifyOtp(data);

        dispatch({
          type: LoginActionTypes.VERIFIED_OTP,
          data: res.data,
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  authenticated: () => {
    return {
      type: LoginActionTypes.AUTHENTICATED,
    };
  },
  setLoggedInStatus: (status) => {
    return {
      type: LoginActionTypes.SET_LOGGED_STATUS,
      status,
    };
  },
  setOtpStatus: (status) => {
    return {
      type: LoginActionTypes.SET_OTP_STATUS,
      status,
    };
  },
  resetOtp: () => {
    return {
      type: LoginActionTypes.RESET_OTP,
    };
  },
  resetLoginError: () => {
    return {
      type: LoginActionTypes.RESET_LOGIN_ERROR,
    };
  },
  resetOtpError: () => {
    return {
      type: LoginActionTypes.RESET_OTP_ERROR,
    };
  },
  setOtpError: (error) => {
    return {
      type: LoginActionTypes.SET_OTP_ERROR,
      error,
    };
  },
  logOut: (logoutMsg) => {
    LoginApi.logout();
    return {
      type: LoginActionTypes.LOGOUT,
      logoutMsg,
    };
  },
  forgotPassword: (data, callback) => {
    return async (dispatch) => {
      try {
        ApiActions.request(dispatch);
        const res = await LoginApi.forgotPwd(data);
        dispatch({
          type: res.data.error
            ? LoginActionTypes.FORGOT_PWD_ERROR
            : LoginActionTypes.FORGOT_PWD,
          ...(res.data.error && { error: res.data.message }),
        });
        ApiActions.success(dispatch);
        !res.data.error && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  resetPassword: (data, callback) => {
    return async (dispatch) => {
      try {
        ApiActions.request(dispatch);
        const res = await LoginApi.resetPassword(data);
        dispatch({
          type: LoginActionTypes.RESET_PWD,
          data: res.data,
        });

        if (!_.get(res, "data.error", false)) {
          Toast.success(_.get(res, "data.message", ""));
        } else {
          Toast.error(_.get(res, "data.message", ""));
        }
        ApiActions.success(dispatch);
        !res.data.error && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  setForgotPwdError: (error) => {
    return {
      type: LoginActionTypes.FORGOT_PWD_ERROR,
      error,
    };
  },
  setUsernameExistsError: (error) => {
    return {
      type: LoginActionTypes.USERNAME_EXISTS_ERROR,
      error,
    };
  },
  setFirst_login: (first_login, cb) => {
    return (dispatch) => {
      dispatch({
        type: LoginActionTypes.SET_FIRST_LOGIN,
        first_login,
      });
      cb && cb();
    };
  },
};
