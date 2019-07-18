import { CustomerActionTypes } from "../actionTypes";
import _ from "lodash";

const initialState = {
  customers: [],
  customerCount: 0,
  selectedCustomer: null,
  subscriptionsInUse: [],
  licencesUnAssigned: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CustomerActionTypes.FETCH_CUSTOMERS: {
      return {
        ...state,
        customers: action.data.data,
        customerCount: action.data.customerCount
      };
    }
    case CustomerActionTypes.SET_SELECTED_CUSTOMER: {
      return {
        ...state,
        selectedCustomer: action.customer
      };
    }
    case CustomerActionTypes.SUBSCRIPTIONS_IN_USE: {
      return {
        ...state,
        subscriptionsInUse: action.data.data
      };
    }
    case CustomerActionTypes.LICENCES_UN_ASSIGNED: {
      return {
        ...state,
        licencesUnAssigned: action.data
      };
    }
    case CustomerActionTypes.RESET_IN_USE_UN_ASSIGNED: {
      return {
        ...state,
        subscriptionsInUse: [],
        licencesUnAssigned: []
      };
    }
    default:
      return state;
  }
};
