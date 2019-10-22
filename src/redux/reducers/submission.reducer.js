import _ from "lodash";
import { SubmissionActionTypes } from "../actionTypes";

const initialState = {
  sequences: {},
  selectedSequence: null,
  sequenceJson: {},
  lifeCycleJson: {},
  validations: {},
  find: {
    searchResults: [],
    selected: "",
    searchText: "",
    matchCase: false,
    matchWholeword: false,
    sortFile: "asc",
    sortTitle: "asc"
  }
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
          [action.id]: action.data.data
        }
      };
    }
    case SubmissionActionTypes.FIND_TEXT: {
      return {
        ...state,
        find: {
          ...state.find,
          searchResults: action.data.data,
          searchText: action.text
        }
      };
    }
    case SubmissionActionTypes.FIND_SELECTED_RESULT: {
      const search = action.selected;
      return {
        ...state,
        find: {
          ...state.find,
          selected: `${search.ID}_${search.name}_${search.title}`
        }
      };
    }
    case SubmissionActionTypes.FIND_MATCH_BY: {
      return {
        ...state,
        find: {
          ...state.find,
          [action.match]: !state.find[action.match]
        }
      };
    }
    case SubmissionActionTypes.FIND_SORT_BY_TITLE: {
      const order = state.find.sortTitle === "asc" ? "desc" : "asc";
      const searchResults = _.orderBy(
        state.find.searchResults,
        ["title"],
        [order]
      );
      return {
        ...state,
        find: {
          ...state.find,
          searchResults,
          sortTitle: order
        }
      };
    }
    case SubmissionActionTypes.FIND_SORT_BY_FILE: {
      const order = state.find.sortFile === "asc" ? "desc" : "asc";
      const searchResults = _.orderBy(
        state.find.searchResults,
        ["name"],
        [order]
      );
      return {
        ...state,
        find: {
          ...state.find,
          searchResults,
          sortFile: order
        }
      };
    }
    case SubmissionActionTypes.CLEAR_SEARCH_RESULTS: {
      return {
        ...state,
        find: {
          ...state.find,
          searchResults: [],
          searchText: ""
        }
      };
    }
    case SubmissionActionTypes.RESET_FIND: {
      return {
        ...state,
        find: {
          ...initialState.find
        }
      };
    }
    default:
      return state;
  }
};
