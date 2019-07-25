import { UsermanagementActionTypes } from "../actionTypes";
import _ from "lodash";
import ApiActions from "./api.actions";
import { UsermanagementApi } from "../api";
import { Toast } from "../../uikit/components";

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
        const res = await UsermanagementApi.fetchAvailableLicences(customerId);
        let licences = _.get(res, "data.licences", {});
        const licencesByType = _.groupBy(licences, "licenceType");
        let newLicences = [];
        _.map(licencesByType, appLicences => {
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
        newLicences = _.sortBy(newLicences, "duration");
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
  getAllLicences: customerId => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchAllLicences(customerId);
        const data = res.data.data;
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
  resetAllLicences: () => {
    return {
      type: UsermanagementActionTypes.RESET_ALL_LICENCES
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
        if (!res.data.error) {
          Toast.success("User Created!");
          history.goBack();
        }
        ApiActions.success(dispatch);
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
        if (!res.data.error) {
          Toast.success("User Updated!");
          history.goBack();
        }
        ApiActions.success(dispatch);
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
        !res.data.error && Toast.success("User Status Updated!");
        ApiActions.success(dispatch);
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
  assignLicense: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.assignLicense(data);
        dispatch({
          type: UsermanagementActionTypes.ASSIGN_LICENSE,
          data: res.data
        });
        !res.data.error && callback();
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
