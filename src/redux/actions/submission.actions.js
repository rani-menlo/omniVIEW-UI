import _ from "lodash";
import { SubmissionActionTypes } from "../actionTypes";
import { SubmissionApi } from "../api";
import { ApiActions } from ".";

export default {
  fetchSequences: submissionId => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = { data: [] };
        const selectedCustomer = getState().Customer.selectedCustomer;
        const sequences = getState().Submission.sequences;
        const id = `${_.get(selectedCustomer, "id", "")}_${submissionId}`;
        if (sequences[id]) {
          data.data = sequences[id];
        } else {
          const res = await SubmissionApi.fetchSequences({ id: submissionId });
          data = res.data;
        }
        dispatch({
          type: SubmissionActionTypes.FETCH_SEQUENCES,
          data,
          id
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchLifeCycleJson: submission => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = "";
        const selectedCustomer = getState().Customer.selectedCustomer;
        const id = `${_.get(selectedCustomer, "id", "")}_${submission.id}`;
        const lifeCycleJson = getState().Submission.lifeCycleJson;
        if (lifeCycleJson[id]) {
          data = lifeCycleJson[id];
        } else {
          const res = await SubmissionApi.fetchJson({
            id: submission.life_cycle_json_path
          });
          data = res.data;
        }
        dispatch({
          type: SubmissionActionTypes.FETCH_LIFE_CYCLE_JSON,
          data,
          id
        });
        ApiActions.success(dispatch);
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchSequenceJson: sequence => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = "";
        const selectedCustomer = getState().Customer.selectedCustomer;
        const selectedSubmission = getState().Application.selectedSubmission;
        const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
          selectedSubmission,
          "id",
          ""
        )}_${sequence.id}`;
        const sequenceJson = getState().Submission.sequenceJson;
        if (sequenceJson[id]) {
          data = sequenceJson[id];
        } else {
          const res = await SubmissionApi.fetchJson({ id: sequence.json_path });
          data = res.data;
        }
        dispatch({
          type: SubmissionActionTypes.FETCH_SEQUENCE_JSON,
          data,
          id
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
  validateSequence: sequenceId => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = { data: {} };
        const selectedCustomer = getState().Customer.selectedCustomer;
        const selectedSubmission = getState().Application.selectedSubmission;
        const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
          selectedSubmission,
          "id",
          ""
        )}_${sequenceId}`;
        /* const validations = getState().Submission.validations;
        if (validations[id]) {
          data.data = validations[id];
        } else {
          const res = await SubmissionApi.validateSquence({ id: sequenceId });
          data = res.data;
        } */
        const res = await SubmissionApi.validateSquence({ id: sequenceId });
        data = res.data;
        dispatch({
          type: SubmissionActionTypes.VALIDATE_SEQUENCE,
          data,
          id
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  }
};
