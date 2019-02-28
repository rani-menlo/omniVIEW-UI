import { CustomerActionTypes } from "../actionTypes";
import { CustomerApi } from "../api";
import { ApiActions } from ".";

export default {
  fetchCustomersByList: (pageNo, itemsPerPage, sortBy, order, search) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await CustomerApi.fetchCustomersByList(
          pageNo,
          itemsPerPage,
          sortBy,
          order,
          search
        );
        dispatch({
          type: CustomerActionTypes.FETCH_CUSTOMERS,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchCustomers: search => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await CustomerApi.fetchCustomers(search);
        dispatch({
          type: CustomerActionTypes.FETCH_CUSTOMERS,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  setSelectedCustomer: customer => {
    return {
      type: CustomerActionTypes.SET_SELECTED_CUSTOMER,
      customer
    };
  }
};