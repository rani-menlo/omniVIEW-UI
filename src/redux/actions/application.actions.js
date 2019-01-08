import { ApplicationActionTypes } from "../actionTypes";
import { ApplicationApi } from "../api";
import { ApiActions } from ".";

export default {
  fetchApplications: customerId => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await ApplicationApi.fetchApplications(customerId);
        dispatch({
          type: ApplicationActionTypes.FETCH_APPLICATIONS,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  setSelectedSubmission: submission => {
    return {
      type: ApplicationActionTypes.SET_SELECTED_SUBMISSION,
      submission
    };
  }
};
