import { ApiActionTypes } from '../actionTypes';

const initialState = {
  loading: false,
  error: ''
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ApiActionTypes.REQUEST: {
      return {
        ...state,
        loading: true
      };
    }
    case ApiActionTypes.SUCCESS: {
      return {
        ...state,
        loading: false
      };
    }
    case ApiActionTypes.FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.error
      };
    }
    default:
      return state;
  }
};
