import { CustomerActionTypes } from "../actionTypes";
import _ from "lodash";

const initialState = {
  customers: [],
  customerCount: 0,
  selectedCustomer: null,
  oAdminCustomer: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CustomerActionTypes.FETCH_CUSTOMERS: {
      const oAdminCustomer = _.find(
        action.data.data,
        customer => customer.is_omnicia
      );
      oAdminCustomer && _.remove(action.data.data, { id: oAdminCustomer.id });
      return {
        ...state,
        oAdminCustomer: oAdminCustomer || state.oAdminCustomer,
        customers: action.data.data,
        customerCount: action.data.customerCount - 1
      };
    }
    case CustomerActionTypes.SET_SELECTED_CUSTOMER: {
      return {
        ...state,
        selectedCustomer: action.customer
      };
    }
    default:
      return state;
  }
};
