import { CustomerActionTypes } from '../actionTypes';

const initialState = {
  customers: [],
  selectedCustomer: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CustomerActionTypes.FETCH_CUSTOMERS: {
      return {
        ...state,
        customers: action.data.data
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
