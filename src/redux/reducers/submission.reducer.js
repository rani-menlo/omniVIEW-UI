import _ from "lodash";
import { SubmissionActionTypes } from "../actionTypes";

const initialState = {
  sequences: {},
  selectedSequence: null,
  sequenceJson: {},
  lifeCycleJson: {},
  validations: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SubmissionActionTypes.FETCH_SEQUENCES: {
      const sequences = { ...state.sequences };
      if (!action.data.error) {
        sequences[action.id] = action.data.data;
      }
      return {
        ...state,
        sequences
      };
    }
    case SubmissionActionTypes.FETCH_SEQUENCE_JSON: {
      return {
        ...state,
        sequenceJson: { ...state.sequenceJson, [action.id]: action.data }
      };
    }
    case SubmissionActionTypes.FETCH_LIFE_CYCLE_JSON: {
      return {
        ...state,
        lifeCycleJson: { ...state.lifeCycleJson, [action.id]: action.data }
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
        validations: {
          ...state.validations,
          [action.id]: action.data
        }
      };
    }
    default:
      return state;
  }
};
