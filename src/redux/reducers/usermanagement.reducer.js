import _ from "lodash";
import { message } from "antd";
import { UsermanagementActionTypes } from "../actionTypes";

const initialState = {
  users: {},
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
        departments: action.data
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
        allLicences: action.data
      };
    }
    case UsermanagementActionTypes.FETCH_USERS: {
      return {
        ...state,
        users: { ...action.data.data }
      };
    }
    case UsermanagementActionTypes.SET_SELECTED_USER: {
      return {
        ...state,
        selectedUser: action.user
      };
    }
    case UsermanagementActionTypes.ADD_USER:
    case UsermanagementActionTypes.ADD_CUSTOMER:
    case UsermanagementActionTypes.UPDATE_USER: {
      if (action.data.error) {
        message.error(action.data.message);
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
