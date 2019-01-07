import { ApplicationActionTypes } from "../actionTypes";

const initialState = {
  submissions: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ApplicationActionTypes.FETCH_APPLICATIONS: {
      return {
        ...state,
        submissions: action.data.message
      };
    }
    default:
      return state;
  }
};
