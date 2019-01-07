import { LoginActionTypes } from "../actionTypes";
import { message as MessageBox } from "antd";

const initialState = {
  user: null,
  loggedIn: false,
  otpReceived: false,
  otp: {
    verified: false,
    verifying: false
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LoginActionTypes.LOGIN: {
      const { error, message, data } = action.data;
      if (error) {
        MessageBox.error(message);
        return {
          ...state
        };
      }
      localStorage.setItem("token", data.token);
      return {
        ...state,
        loggedIn: true,
        userId: data.userId,
        name: data.name,
        email: data.email
      };
    }
    case LoginActionTypes.SEND_OTP: {
      return {
        ...state,
        otpReceived: true
      };
    }
    case LoginActionTypes.VERIFY_OTP: {
      return {
        ...state,
        otp: {
          ...state.otp,
          verifying: true
        }
      };
    }
    case LoginActionTypes.VERIFIED_OTP: {
      const { error, message, data } = action.data;
      if (error) {
        MessageBox.error(message);
        return {
          ...state,
          otp: {
            ...state.otp,
            verifying: false
          }
        };
      }
      localStorage.setItem("token", data.token);
      return {
        ...state,
        user: data.userData,
        otp: {
          ...state.otp,
          verifying: false,
          verified: true
        }
      };
    }
    default:
      return state;
  }
};
