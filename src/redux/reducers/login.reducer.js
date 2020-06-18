import { LoginActionTypes } from "../actionTypes";
import _ from "lodash";
import { message } from "antd";
import { Toast } from "../../uikit/components";

const initialState = {
  user: null,
  role: null,
  customerAccounts: [],
  customerProfileAccounts: [],
  invalid_license: false,
  profileUpdated: false,
  login: {
    loggedIn: false,
    error: "",
    logoutMsg: "",
  },
  otp: {
    error: "",
    invalid_license: false,
    otpReceived: false,
    verified: false,
    verifying: false,
    authorized: false,
  },
  forgotPwdError: "",
  usernameExists: "",
  customer: "",
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
            logoutMsg: "",
          },
        };
      }
      return {
        ...state,
        login: {
          ...state.login,
          error: "",
          logoutMsg: "",
          loggedIn: true,
        },
        userId: data.userId,
        name: data.name,
        email: data.email,
        "omniview-pro": _.find(
          data.licenses,
          (licence) => licence.type_slug === "omniview-pro"
        ),
      };
    }
    case LoginActionTypes.SEND_OTP: {
      return {
        ...state,
        otp: {
          ...state.otp,
          otpReceived: true,
        },
      };
    }
    case LoginActionTypes.VERIFY_OTP: {
      return {
        ...state,
        otp: {
          ...state.otp,
          verifying: true,
        },
      };
    }
    case LoginActionTypes.VERIFIED_OTP: {
      const { error, message, data, invalid_license } = action.data;
      if (!invalid_license && error) {
        return {
          ...state,
          customerAccounts: [],
          otp: {
            ...state.otp,
            error: message,
            verifying: false,
          },
        };
      }
      !invalid_license &&
        localStorage.setItem("omniview_user_token", _.get(data, "token", ""));
      let customerAccounts = _.get(data.customerProfiles, "userProfiles", []);
      let user = "",
        role = "";
      if (customerAccounts.length == 1) {
        user = _.get(customerAccounts[0], "userData", "");
        role = _.get(customerAccounts[0], "role", "");
      }
      return {
        ...state,
        user: user,
        role: role,
        customerAccounts: customerAccounts,
        otp: {
          ...state.otp,
          invalid_license,
          verifying: false,
          verified: true,
        },
      };
    }
    case LoginActionTypes.FETCH_CUSTOMER_ACCOUNTS: {
      return {
        ...state,
        customerProfileAccounts: _.get(
          action.data.data,
          "customer_user_profiles",
          []
        ),
      };
    }
    case LoginActionTypes.SWITCH_ACCOUNT: {
      const { error, message, data, invalid_license } = action.data;
      if (!invalid_license && error) {
        return {
          ...state,
        };
      }
      !invalid_license &&
        localStorage.setItem("omniview_user_token", _.get(data, "token", ""));
      return {
        ...state,
        invalid_license,
        user: _.get(action.data.data.userData.userObject, "user_profile", ""),
        role: _.get(action.data.data.userData.userObject, "role", ""),
        customer: _.get(action.data.data.userData.userObject, "customer", ""),
      };
    }
    case LoginActionTypes.AUTHENTICATED: {
      return {
        ...state,
        otp: {
          ...state.otp,
          authorized: true,
        },
      };
    }
    case LoginActionTypes.SET_LOGGED_STATUS: {
      return {
        ...state,
        login: {
          ...state.login,
          loggedIn: action.status,
        },
      };
    }
    case LoginActionTypes.RESET_LOGIN_ERROR: {
      return {
        ...state,
        login: {
          ...state.login,
          error: "",
          logoutMsg: "",
        },
      };
    }
    case LoginActionTypes.SET_OTP_STATUS: {
      return {
        ...state,
        otp: {
          ...state.otp,
          otpReceived: action.status,
        },
      };
    }
    case LoginActionTypes.RESET_OTP: {
      return {
        ...state,
        otp: {
          ...state.otp,
          verified: false,
          verifying: false,
        },
      };
    }
    case LoginActionTypes.SET_OTP_ERROR: {
      return {
        ...state,
        otp: {
          ...state.otp,
          error: action.error,
        },
      };
    }
    case LoginActionTypes.RESET_OTP_ERROR: {
      return {
        ...state,
        otp: {
          ...state.otp,
          error: "",
        },
      };
    }
    case LoginActionTypes.CREATE_UPDATE_PROFILE: {
      if (action.data.error) {
        Toast.error(action.data.message);
        return state;
      }
      return {
        ...state,
        profileUpdated: true,
        user: { ...state.user, ...action.data.data },
      };
    }
    case LoginActionTypes.CHECK_USERNAME: {
      let error = "";
      if (action.data.error) {
        error = action.data.message;
      }
      if (action.error) {
        error = action.error;
      }
      return {
        ...state,
        usernameExists: error,
      };
    }
    case LoginActionTypes.FORGOT_PWD_ERROR: {
      return {
        ...state,
        forgotPwdError: action.error,
      };
    }
    case LoginActionTypes.USERNAME_EXISTS_ERROR: {
      return {
        ...state,
        usernameExists: "",
      };
    }
    default:
      return state;
  }
};
