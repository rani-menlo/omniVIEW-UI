import { ApplicationActionTypes } from "../actionTypes";
import { ApplicationApi } from "../api";
import { ApiActions } from ".";

export default {
  fetchApplications: customerId => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = {data: []};
        const submissions = getState().Application.submissions;
        if (submissions[customerId]) {
          data.data = submissions[customerId];
        } else {
          const res = await ApplicationApi.fetchApplications(customerId);
          data = res.data;
        }
        dispatch({
          type: ApplicationActionTypes.FETCH_APPLICATIONS,
          data,
          customerId
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
