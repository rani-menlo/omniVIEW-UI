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
  }
};
