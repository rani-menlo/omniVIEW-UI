import { LoginActionTypes } from "../actionTypes";
import _ from "lodash";
import { message } from "antd";
import { Toast } from "../../uikit/components";

const initialState = {
  user: null,
  role: null,
  login: {
    loggedIn: false,
    error: "",
    logoutMsg: ""
  },
  otp: {
    error: "",
    invalid_license: false,
    otpReceived: false,
    verified: false,
    verifying: false
  },
  forgotPwdError: ""
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LoginActionTypes.LOGIN: {
      const { error, message, data } = action.data;
      localStorage.setItem("omniview_user_token", _.get(data, "token", ""));
      if (error) {
        return {
          ...state,
          login: {
            ...state.login,
            error: message,
            logoutMsg: ""
          }
        };
      }
      return {
        ...state,
        login: {
          ...state.login,
          error: "",
          logoutMsg: "",
          loggedIn: true
        },
        userId: data.userId,
        name: data.name,
        email: data.email,
        "omniview-pro": _.find(
          data.licenses,
          licence => licence.type_slug === "omniview-pro"
        )
      };
    }
    case LoginActionTypes.SEND_OTP: {
      return {
        ...state,
        otp: {
          ...state.otp,
          otpReceived: true
        }
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
      const { error, message, data, invalid_license } = action.data;
      if (!invalid_license && error) {
        return {
          ...state,
          otp: {
            ...state.otp,
            error: message,
            verifying: false
          }
        };
      }
      !invalid_license &&
        localStorage.setItem("omniview_user_token", _.get(data, "token", ""));
      return {
        ...state,
        user: _.get(data, "userData", ""),
        role: _.get(data, "role", ""),
        otp: {
          ...state.otp,
          invalid_license,
          verifying: false,
          verified: true
        }
      };
    }
    case LoginActionTypes.SET_LOGGED_STATUS: {
      return {
        ...state,
        login: {
          ...state.login,
          loggedIn: action.status
        }
      };
    }
    case LoginActionTypes.RESET_LOGIN_ERROR: {
      return {
        ...state,
        login: {
          ...state.login,
          error: "",
          logoutMsg: ""
        }
      };
    }
    case LoginActionTypes.SET_OTP_STATUS: {
      return {
        ...state,
        otp: {
          ...state.otp,
          otpReceived: action.status
        }
      };
    }
    case LoginActionTypes.RESET_OTP: {
      return {
        ...state,
        otp: {
          ...state.otp,
          verified: false,
          verifying: false
        }
      };
    }
    case LoginActionTypes.SET_OTP_ERROR: {
      return {
        ...state,
        otp: {
          ...state.otp,
          error: action.error
        }
      };
    }
    case LoginActionTypes.RESET_OTP_ERROR: {
      return {
        ...state,
        otp: {
          ...state.otp,
          error: ""
        }
      };
    }
    case LoginActionTypes.CREATE_UPDATE_PROFILE: {
      if (action.data.error) {
        Toast.error(action.data.message);
        return state;
      }
      return {
        ...state,
        user: { ...state.user, ...action.data.data }
      };
    }
    case LoginActionTypes.FORGOT_PWD_ERROR: {
      return {
        ...state,
        forgotPwdError: action.error
      };
    }
    default:
      return state;
  }
};
