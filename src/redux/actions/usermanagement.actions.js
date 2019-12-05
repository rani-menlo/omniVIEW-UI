import { UsermanagementActionTypes } from "../actionTypes";
import _ from "lodash";
import moment from "moment";
import ApiActions from "./api.actions";
import { UsermanagementApi } from "../api";
import { Toast } from "../../uikit/components";
import { getCombinedLicences } from "../../utils";

export default {
  getDepartments: noLoading => {
    return async (dispatch, getState) => {
      !noLoading && ApiActions.request(dispatch);
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
        !noLoading && ApiActions.success(dispatch);
      } catch (err) {
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
        const newLicences = getCombinedLicences(licences);
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
  fetchAdmins: (data, cb) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.fetchUsers(data);
        dispatch({
          type: UsermanagementActionTypes.FETCH_CUSTOMER_ADMINS,
          data: res.data
        });
        ApiActions.success(dispatch);
        cb && cb();
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
  addUser: (user, cb) => {
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
          cb && cb();
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
          Toast.success("User details have been updated!");
          history.goBack();
        }
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  activateDeactivateUser: (usr, cb) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.activateDeactivateUser(usr);
        ApiActions.success(dispatch);
        !res.data.error && cb && cb();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  deleteusers: (data, cb) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.deleteUser(data);
        ApiActions.success(dispatch);
        !res.data.error && cb && cb();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  updateSecondaryContacts: (data, cb) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.updateSecondaryContacts(data);
        ApiActions.success(dispatch);
        !res.data.error && cb && cb();
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
  getLicenseInfo: () => {
    return UsermanagementApi.getLicenseInfo();
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
        ApiActions.success(dispatch);
        !res.data.error && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },

  removeLicense: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.revokeLicense(data);
        dispatch({
          type: UsermanagementActionTypes.REVOKE_LICENSE,
          data: res.data
        });
        ApiActions.success(dispatch);
        !res.data.error && callback();
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
  }),
  resendInvitationMail: (data, cb) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await UsermanagementApi.resendInvitationMail(data);
        !res.data.error && cb && cb();
        /* dispatch({
          type: UsermanagementActionTypes.RESEND_INVITATION_MAIL,
          data: res.data
        }); */
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  }
};
