import { ApplicationActionTypes } from "../actionTypes";

const initialState = {
  submissions: [],
  selectedSubmission: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ApplicationActionTypes.FETCH_APPLICATIONS: {
      return {
        ...state,
        submissions: action.data.message
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
