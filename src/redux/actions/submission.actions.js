import _ from 'lodash';
import { SubmissionActionTypes } from '../actionTypes';
import { SubmissionApi } from '../api';
import { ApiActions } from '.';

export default {
  fetchSequences: submissionId => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        let res = await SubmissionApi.fetchSequences({ id: submissionId });
        dispatch({
          type: SubmissionActionTypes.FETCH_SEQUENCES,
          data: res.data
        });
        /* const firstSequence = _.get(res, "data.message[0]");
        if (firstSequence) {
          res = await SubmissionApi.fetchJson({ id: firstSequence.json_path });
          dispatch({
            type: SubmissionActionTypes.FETCH_SEQUENCE_JSON,
            sequence: firstSequence,
            data: res.data
          });
        } */
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchLifeCycleJson: submission => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await SubmissionApi.fetchJson({
          id: submission.life_cycle_json_path
        });
        dispatch({
          type: SubmissionActionTypes.FETCH_LIFE_CYCLE_JSON,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchSequenceJson: sequence => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await SubmissionApi.fetchJson({ id: sequence.json_path });
        dispatch({
          type: SubmissionActionTypes.FETCH_SEQUENCE_JSON,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  setSelectedSequence: sequence => {
    return {
      type: SubmissionActionTypes.SET_SELECTED_SEQUENCE,
      sequence
    };
  },
  validateSequence: (sequenceId) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await SubmissionApi.validateSquence({ id: sequenceId });
        dispatch({
          type: SubmissionActionTypes.VALIDATE_SEQUENCE,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  }
};
