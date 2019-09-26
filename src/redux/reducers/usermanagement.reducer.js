import _ from "lodash";
import { message } from "antd";
import { UsermanagementActionTypes } from "../actionTypes";
import { Toast } from "../../uikit/components";

const initialState = {
  users: null,
  cAdmins: [],
  usersOfFileOrSubmission: [],
  usersCount: 0,
  departments: [],
  licences: [],
  allLicences: [],
  selectedUser: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UsermanagementActionTypes.FETCH_DEPARTMENTS: {
      return {
        ...state,
        departments: _.sortBy(action.data, "name") || []
      };
    }
    case UsermanagementActionTypes.FETCH_LICENCES: {
      return {
        ...state,
        licences: action.data
      };
    }
    case UsermanagementActionTypes.FETCH_ALL_LICENCES: {
      return {
        ...state,
        allLicences: _.sortBy(action.data, ["duration", "type_name"])
      };
    }
    case UsermanagementActionTypes.RESET_ALL_LICENCES: {
      return {
        ...state,
        allLicences: []
      };
    }
    case UsermanagementActionTypes.FETCH_USERS: {
      if (!action.data.error) {
        return {
          ...state,
          users: action.data.data,
          usersCount: action.data.usercount
        };
      }
    }
    case UsermanagementActionTypes.FETCH_CUSTOMER_ADMINS: {
      if (!action.data.error) {
        return {
          ...state,
          cAdmins: action.data.data
        };
      }
    }
    case UsermanagementActionTypes.FETCH_USERS_OF_FILE_OR_SUBMISSION: {
      if (!action.data.error) {
        return {
          ...state,
          usersOfFileOrSubmission: action.data.data
        };
      }
    }
    case UsermanagementActionTypes.SET_SELECTED_USER: {
      return {
        ...state,
        selectedUser: action.user
      };
    }
    case UsermanagementActionTypes.ADD_USER: {
      if (action.data.error) {
        Toast.error(action.data.message);
        return state;
      }
      return {
        ...state,
        selectedUser: null,
        licences: []
      };
    }
    case UsermanagementActionTypes.UPDATE_USER: {
      if (action.data.error) {
        Toast.error(action.data.message);
        return state;
      }
      return {
        ...state,
        selectedUser: null
      };
    }
    default:
      return state;
  }
};
