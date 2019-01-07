import { CustomerActionTypes } from "../actionTypes";

const initialState = {
  customers: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CustomerActionTypes.FETCH_CUSTOMERS: {
      return {
        ...state,
        customers: action.data.customers
      };
    }
    default:
      return state;
  }
};
