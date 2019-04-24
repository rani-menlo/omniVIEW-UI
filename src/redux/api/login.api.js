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
  createOrUpdateProfile: data => {
    return api.post(URI.CREATE_UPDATE_PROFILE, data);
  }
};
