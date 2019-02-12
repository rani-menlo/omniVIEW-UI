import { ApplicationActionTypes } from "../actionTypes";

const initialState = {
  submissions: {},
  selectedSubmission: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ApplicationActionTypes.FETCH_APPLICATIONS: {
      let submissions = {...state.submissions};
      if (!action.data.error) {
        submissions[action.customerId] = action.data.data;
      }
      return {
        ...state,
        submissions
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
