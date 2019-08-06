import api from ".";
import { URI } from "../../constants";

export default {
  login: data => {
    return api.post(URI.LOGIN, data);
  },
  sendOtp: data => {
    return api.post(URI.OTP, data);
  },
  verifyOtp: data => {
    return api.post(URI.OTP_VERIFY, data);
  },
  forgotPwd: data => {
    return api.post(URI.FORGOT_PWD, data);
  },
  resetPassword: data => {
    return api.post(URI.RESET_PWD.replace(":key", data.key), data);
  },
  createOrUpdateProfile: data => {
    return api.post(URI.CREATE_UPDATE_PROFILE, data);
  },
  logout: () => {
    return api.get(URI.LOGOUT);
  }
};
