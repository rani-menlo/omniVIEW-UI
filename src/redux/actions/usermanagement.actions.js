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
        const licencesByApp = _.groupBy(licences, "app_name");
        let newLicences = [];
        _.map(licencesByApp, appLicences => {
          const licencesByName = _.groupBy(appLicences, "name");
          _.map(licencesByName, (licences, name) => {
            const revokedLicences = _.filter(licences, "revoked_date");
            /* if (revokedLicences.length) {
              newLicences = [...newLicences, ...revokedLicences];
              licences = _.filter(
                licences,
                li => !revokedLicences.includes(li)
              );
            } */
            licences = _.difference(licences, revokedLicences);
            const licencesByDate = _.groupBy(licences, "purchase_date");
            _.map(licencesByDate, licences => {
              licences[0].remaining = licences.length;
              newLicences.push(licences[0]);
            });
          });
        });
        dispatch({
          type: UsermanagementActionTypes.FETCH_LICENCES,
          data: newLicences
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  resetLicences: () => ({
    type: UsermanagementActionTypes.FETCH_LICENCES,
    data: []
  }),
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
  fetchUsers: data => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchUsers(data);
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
  resetUsers: () => ({
    type: UsermanagementActionTypes.FETCH_USERS,
    data: { data: [] }
  }),
  resetUsersOfFileOrSubmission: () => ({
    type: UsermanagementActionTypes.FETCH_USERS_OF_FILE_OR_SUBMISSION,
    data: { data: [] }
  }),
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
        !res.data.error && history.goBack();
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
        !res.data.error && history.goBack();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  activateDeactivateUser: (usr, customerId) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        await UsermanagementApi.activateDeactivateUser(usr);
        const res = await UsermanagementApi.fetchUsers({ customerId });
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
  editCustomer: (customer, history) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.editCustomer(customer);
        dispatch({
          type: UsermanagementActionTypes.EDIT_CUSTOMER,
          data: res.data
        });
        ApiActions.success(dispatch);
        !res.data.error && history.goBack();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchUsersOfSubmissions: (customerId, submission_ids) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchUsersOfSubmissions({
          customerId,
          submission_ids
        });
        dispatch({
          type: UsermanagementActionTypes.FETCH_USERS_OF_FILE_OR_SUBMISSION,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchUsersOfFiles: (customerId, file_ids) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchUsersOfFiles({
          customerId,
          file_ids
        });
        dispatch({
          type: UsermanagementActionTypes.FETCH_USERS_OF_FILE_OR_SUBMISSION,
          data: res.data
        });
        ApiActions.success(dispatch);
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
