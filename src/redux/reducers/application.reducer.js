import { ApplicationActionTypes } from "../actionTypes";

const initialState = {
  submissions: [],
  selectedSubmission: null,
  submissionCount: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ApplicationActionTypes.FETCH_APPLICATIONS: {
      return {
        ...state,
        submissions: action.data.data,
        submissionCount: action.data.submissionCount
      };
    }
    case ApplicationActionTypes.RESET_APPLICATIONS: {
      return {
        ...state,
        submissions: []
      };
    }
    case ApplicationActionTypes.SET_SELECTED_SUBMISSION: {
      return {
        ...state,
        selectedSubmission: action.submission
      };
    }
    default:
      return state;
  }
};
