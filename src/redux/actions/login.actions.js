import { LoginActionTypes } from "../actionTypes";
import { ApiActions } from ".";
import { LoginApi } from "../api";

export default {
  login: data => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.login(data);
        dispatch({
          type: LoginActionTypes.LOGIN,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  createOrUpdateProfile: (data, history) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.createOrUpdateProfile(data);
        dispatch({
          type: LoginActionTypes.CREATE_UPDATE_PROFILE,
          data: res.data
        });
        ApiActions.success(dispatch);
        !res.data.error && history.push("/customers");
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  sendOtp: data => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await LoginApi.sendOtp(data);
        dispatch({
          type: LoginActionTypes.SEND_OTP,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  verifyOtp: data => {
    return async dispatch => {
      try {
        dispatch({
          type: LoginActionTypes.VERIFY_OTP
        });
        const res = await LoginApi.verifyOtp(data);
        dispatch({
          type: LoginActionTypes.VERIFIED_OTP,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  setLoggedInStatus: status => {
    return {
      type: LoginActionTypes.SET_LOGGED_STATUS,
      status
    };
  },
  setOtpStatus: status => {
    return {
      type: LoginActionTypes.SET_OTP_STATUS,
      status
    };
  },
  resetOtp: () => {
    return {
      type: LoginActionTypes.RESET_OTP
    };
  },
  resetLoginError: () => {
    return {
      type: LoginActionTypes.RESET_LOGIN_ERROR
    };
  },
  resetOtpError: () => {
    return {
      type: LoginActionTypes.RESET_OTP_ERROR
    };
  },
  setOtpError: error => {
    return {
      type: LoginActionTypes.SET_OTP_ERROR,
      error
    };
  },
  logOut: () => {
    return {
      type: LoginActionTypes.LOGOUT
    };
  }
};
