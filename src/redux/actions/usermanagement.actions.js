import { UsermanagementActionTypes } from "../actionTypes";
import _ from "lodash";
import ApiActions from "./api.actions";
import { UsermanagementApi } from "../api";

export default {
  getDepartments: () => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        const departments = getState().Usermanagement.departments;
        let data = [];
        if (departments.length) {
          data = departments;
        } else {
          const res = await UsermanagementApi.fetchDepartments();
          data = res.data.departments;
        }
        dispatch({
          type: UsermanagementActionTypes.FETCH_DEPARTMENTS,
          data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  getLicences: customerId => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchLicences(customerId);
        let licences = _.get(res, "data.licences", {});
        if (licences["omni-view"]) {
          licences = _.spread(_.union)(_.values(licences["omni-view"]));
        } else {
          licences = _.spread(_.union)(_.values(licences["omni-file"]));
        }
        dispatch({
          type: UsermanagementActionTypes.FETCH_LICENCES,
          data: licences
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  getAllLicences: () => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        const licences = getState().Usermanagement.allLicences;
        let data = [];
        if (licences.length) {
          data = licences;
        } else {
          const res = await UsermanagementApi.fetchAllLicences();
          data = res.data.data;
        }
        dispatch({
          type: UsermanagementActionTypes.FETCH_ALL_LICENCES,
          data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchUsers: (customerId, search) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchUsers(customerId, search);
        dispatch({
          type: UsermanagementActionTypes.FETCH_USERS,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  addUser: (user, history) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.addUser(user);
        dispatch({
          type: UsermanagementActionTypes.ADD_USER,
          data: res.data
        });
        ApiActions.success(dispatch);
        history.goBack();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  updateUser: (user, history) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.updateUser(user);
        dispatch({
          type: UsermanagementActionTypes.UPDATE_USER,
          data: res.data
        });
        ApiActions.success(dispatch);
        history.goBack();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  deactivateUser: (usr, customerId, search) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        await UsermanagementApi.deactivateUser(usr);
        const res = await UsermanagementApi.fetchUsers(customerId, search);
        dispatch({
          type: UsermanagementActionTypes.FETCH_USERS,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  addCustomer: (customer, history) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.addCustomer(customer);
        dispatch({
          type: UsermanagementActionTypes.ADD_CUSTOMER,
          data: res.data
        });
        ApiActions.success(dispatch);
        !res.data.error && history.goBack();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  setSelectedUser: user => ({
    type: UsermanagementActionTypes.SET_SELECTED_USER,
    user
  })
};
