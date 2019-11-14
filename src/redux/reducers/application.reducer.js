import { ApplicationActionTypes } from "../actionTypes";

const initialState = {
  submissions: [],
  selectedSubmission: null,
  submissionCount: 0,
  submissionCenters: [],
  access: {}
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
    case ApplicationActionTypes.ADD_APPLICATION: {
      return {
        ...state,
        access: action.data
      };
    }
    case ApplicationActionTypes.FETCH_SUBMISSION_CENTERS: {
      return {
        ...state,
        submissionCenters: action.data.data
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
