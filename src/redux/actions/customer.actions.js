import _ from "lodash";
import { CustomerActionTypes } from "../actionTypes";
import { CustomerApi, UsermanagementApi } from "../api";
import { ApiActions } from ".";
import { Toast } from "../../uikit/components";

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
  addCustomer: (customer, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await CustomerApi.addCustomer(customer);
        if (res.data.error) {
          Toast.error(res.data.message);
          ApiActions.failure(dispatch);
        } else {
          dispatch({
            type: CustomerActionTypes.ADD_CUSTOMER,
            data: res.data
          });
          callback && callback();
          ApiActions.success(dispatch);
        }
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  editCustomer: (customer, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await CustomerApi.editCustomer(customer);
        if (res.data.error) {
          Toast.error(res.data.message);
          ApiActions.failure(dispatch);
        } else {
          dispatch({
            type: CustomerActionTypes.EDIT_CUSTOMER,
            data: res.data
          });
          callback && callback();
          ApiActions.success(dispatch);
        }
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  setSelectedCustomer: (customer, cb) => {
    return dispatch => {
      dispatch({
        type: CustomerActionTypes.SET_SELECTED_CUSTOMER,
        customer
      });
      cb && cb();
    };
  },
  activateDeactivateCustomer: (customer, search) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        await CustomerApi.activateDeactivateCustomer(customer);
        const res = await CustomerApi.fetchCustomers(search);
        dispatch({
          type: CustomerActionTypes.FETCH_CUSTOMERS,
          data: res.data
        });
        !res.data.error && Toast.success("Customer Status Updated!");
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  getSubscriptionsInUse: customerId => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await CustomerApi.getSubscriptionsInUse(customerId);
        dispatch({
          type: CustomerActionTypes.SUBSCRIPTIONS_IN_USE,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  getAvailableLicences: customerId => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchAvailableLicences(customerId);
        let licences = _.get(res, "data.licences", {});
        dispatch({
          type: CustomerActionTypes.LICENCES_UN_ASSIGNED,
          data: licences
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  getLicenceLookUps: () => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let lookups = getState().Customer.lookupLicences;
        if (!lookups.licences.length || !lookups.types.length) {
          const res = await CustomerApi.getLicenceLookUps();
          lookups = _.get(res, "data.data");
        }
        dispatch({
          type: CustomerActionTypes.GET_LICENCE_LOOKUPS,
          data: lookups
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  addNewLicences: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await CustomerApi.addNewLicences(data);
        ApiActions.success(dispatch);
        !res.data.error && callback && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  resetLicencesInUseAndUnAssigned: () => {
    return {
      type: CustomerActionTypes.RESET_IN_USE_UN_ASSIGNED
    };
  }
};
