import { ApiActionTypes } from "../actionTypes";

export default {
  request: dispatch => {
    dispatch({ type: ApiActionTypes.REQUEST });
  },
  success: dispatch => {
    dispatch({ type: ApiActionTypes.SUCCESS });
  },
  failure: (dispatch, error) => {
    dispatch({ type: ApiActionTypes.FAILURE, error });
  },
  requestOnDemand: () => {
    return dispatch => {
      dispatch({ type: ApiActionTypes.REQUEST });
    };
  },
  successOnDemand: () => {
    return dispatch => {
      dispatch({ type: ApiActionTypes.SUCCESS });
    };
  }
};
