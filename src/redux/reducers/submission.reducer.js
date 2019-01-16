import { SubmissionActionTypes } from '../actionTypes';

const initialState = {
  sequences: [],
  selectedSequence: null,
  jsonData: null,
  validations: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SubmissionActionTypes.FETCH_SEQUENCES: {
      return {
        ...state,
        sequences: action.data.message
      };
    }
    case SubmissionActionTypes.FETCH_SEQUENCE_JSON:
    case SubmissionActionTypes.FETCH_LIFE_CYCLE_JSON: {
      return {
        ...state,
        jsonData: action.data
      };
    }
    case SubmissionActionTypes.SET_SELECTED_SEQUENCE: {
      return {
        ...state,
        selectedSequence: action.sequence
      };
    }
    case SubmissionActionTypes.VALIDATE_SEQUENCE: {
      return {
        ...state,
        validations: action.data.data
      };
    }
    default:
      return state;
  }
};
