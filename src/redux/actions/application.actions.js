import { ApplicationActionTypes } from "../actionTypes";
import { ApplicationApi } from "../api";
import { ApiActions } from ".";

export default {
  fetchApplicationsByList: (
    customerId,
    pageNo,
    itemsPerPage,
    sortBy,
    order,
    search
  ) => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.fetchApplicationsByList(
          customerId,
          pageNo,
          itemsPerPage,
          sortBy,
          order,
          search
        );
        dispatch({
          type: ApplicationActionTypes.FETCH_APPLICATIONS,
          data: res.data,
          customerId
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchApplications: (customerId, search) => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.fetchApplications(customerId, search);
        dispatch({
          type: ApplicationActionTypes.FETCH_APPLICATIONS,
          data: res.data,
          customerId
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchAddApplication: () => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.fetchAddApplication();
        dispatch({
          type: ApplicationActionTypes.ADD_APPLICATION,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },

  getSubmissionCenters: () => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.fetchSubmissionCenters();
        dispatch({
          type: ApplicationActionTypes.FETCH_SUBMISSION_CENTERS,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  updateSubmissionCenter: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.updateSubmissionCenter(data);
        dispatch({
          type: ApplicationActionTypes.UPDATE_SUBMISSION_CENTER
        });
        ApiActions.success(dispatch);
        !res.data.error && callback && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  retryUploads: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.retryUploads(data);
        dispatch({
          type: ApplicationActionTypes.RETRY_UPLOADS
        });
        ApiActions.success(dispatch);
        !res.data.error && callback && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  deleteSubmission: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.deleteSubmission(data);
        ApiActions.success(dispatch);
        !res.data.error && callback && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  resetApplications: () => {
    return {
      type: ApplicationActionTypes.RESET_APPLICATIONS
    };
  },
  setSelectedSubmission: submission => {
    return {
      type: ApplicationActionTypes.SET_SELECTED_SUBMISSION,
      submission
    };
  }
};
