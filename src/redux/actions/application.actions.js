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
  resetApplications: () => {
    return {
      type: ApplicationActionTypes.RESET_APPLICATIONS
    }
  },
  setSelectedSubmission: submission => {
    return {
      type: ApplicationActionTypes.SET_SELECTED_SUBMISSION,
      submission
    };
  }
};
