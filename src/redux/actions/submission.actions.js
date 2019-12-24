import _ from "lodash";
import { message } from "antd";
import { SubmissionActionTypes } from "../actionTypes";
import { SubmissionApi } from "../api";
import { ApiActions } from ".";
import { Toast } from "../../uikit/components";
// import lifecyclejson from "./life.json";

export default {
  fetchSequences: submissionId => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = { data: [] };
        const selectedCustomer = getState().Customer.selectedCustomer;
        const id = `${_.get(selectedCustomer, "id", "")}_${submissionId}`;
        const sequences = getState().Submission.sequences;
        if (sequences[id]) {
          data.data = sequences[id];
        } else {
          const res = await SubmissionApi.fetchSequences({ id: submissionId });
          data = res.data;
        }
        const res = await SubmissionApi.fetchSequences({ id: submissionId });
        data = res.data;
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
  fetchSequencesWithPermissions: (submissionId, user, callback) => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = { data: [] };
        const selectedCustomer = getState().Customer.selectedCustomer;
        const id = `${_.get(selectedCustomer, "id", "")}_${submissionId}`;
        const res = await SubmissionApi.fetchSequencesWithPermissions({
          id: submissionId,
          userId: user.id ? user.id : user.user_id
        });
        data = res.data;
        dispatch({
          type: SubmissionActionTypes.FETCH_SEQUENCES,
          data,
          id
        });

        !callback && ApiActions.success(dispatch);
        callback && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  resetSequences: (submissionId, callback) => {
    return async (dispatch, getState) => {
      // ApiActions.request(dispatch);
      try {
        let data = { data: [] };
        const selectedCustomer = getState().Customer.selectedCustomer;
        const id = `${_.get(selectedCustomer, "id", "")}_${submissionId}`;
        data = [];
        dispatch({
          type: SubmissionActionTypes.FETCH_SEQUENCES,
          data,
          id
        });
        // ApiActions.success(dispatch);
        callback && callback();
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  resetJson: submission => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = "";
        const selectedCustomer = getState().Customer.selectedCustomer;
        const id = `${_.get(selectedCustomer, "id", "")}_${submission.id}`;
        dispatch({
          type: SubmissionActionTypes.FETCH_LIFE_CYCLE_JSON,
          data,
          id
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  fetchLifeCycleJson: (submission, user, callback) => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = "";
        const selectedCustomer = getState().Customer.selectedCustomer;
        const id = `${_.get(selectedCustomer, "id", "")}_${submission.id}`;
        /*const lifeCycleJson = getState().Submission.lifeCycleJson;
        if (lifeCycleJson[id]) {
          data = lifeCycleJson[id];
        } else {
          const res = await SubmissionApi.fetchJson({
            id: submission.life_cycle_json_path
          });
          data = res.data;
        } */
        const res = await SubmissionApi.fetchJson({
          fileId: submission.life_cycle_json_path,
          userId: user.id ? user.id : user.user_id
        });
        data = res.data;
        dispatch({
          type: SubmissionActionTypes.FETCH_LIFE_CYCLE_JSON,
          data,
          // data: lifecyclejson,
          id
        });
        ApiActions.success(dispatch);
        callback && callback();
      } catch (err) {
        console.log(err);
        ApiActions.failure(dispatch);
      }
    };
  },
  /* fetchLifeCycleJsonWithPermissions: (submission, user) => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        let data = "";
        const selectedCustomer = getState().Customer.selectedCustomer;
        const id = `${_.get(selectedCustomer, "id", "")}_${submission.id}`;
        const res = await SubmissionApi.fetchJsonWithPermissions({
          fileId: submission.life_cycle_json_path,
          userId: user.user_id
        });
        data = res.data;
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
  }, */
  fetchSequenceJson: (sequence, user) => {
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
        /* const sequenceJson = getState().Submission.sequenceJson;
        if (sequenceJson[id]) {
          data = sequenceJson[id];
        } else {
          const res = await SubmissionApi.fetchJson({ id: sequence.json_path });
          data = res.data;
        } */
        const res = await SubmissionApi.fetchJson({
          fileId: sequence.json_path,
          userId: user.id ? user.id : user.user_id
        });
        data = res.data;
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
  /* fetchSequenceJsonWithPermissions: (sequence, user) => {
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
        const res = await SubmissionApi.fetchJsonWithPermissions({
          fileId: sequence.json_path,
          userId: user.user_id
        });
        data = res.data;
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
  }, */
  setSelectedSequence: sequence => {
    return {
      type: SubmissionActionTypes.SET_SELECTED_SEQUENCE,
      sequence
    };
  },
  validateSequence: (sequenceId, callback) => {
    return async (dispatch, getState) => {
      ApiActions.request(dispatch);
      try {
        const selectedCustomer = getState().Customer.selectedCustomer;
        const selectedSubmission = getState().Application.selectedSubmission;
        const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
          selectedSubmission,
          "id",
          ""
        )}_${sequenceId}`;
        const res = await SubmissionApi.validateSquence({ id: sequenceId });
        if (res.data.error) {
          callback && callback(res.data.message);
        } else {
          dispatch({
            type: SubmissionActionTypes.VALIDATE_SEQUENCE,
            data: res.data,
            id
          });
        }
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  assignFilePermissions: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        await SubmissionApi.assignFilePermissions(data);
        dispatch({
          type: SubmissionActionTypes.ASSIGN_PERMISSIONS
        });
        callback && callback();
        !callback && ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  assignSequencePermissions: (data, callback) => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        await SubmissionApi.assignSequencePermissions(data);
        dispatch({
          type: SubmissionActionTypes.ASSIGN_PERMISSIONS
        });
        callback && callback();
        !callback && ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  assignSubmissionPermissions: data => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await SubmissionApi.assignSubmissionPermissions(data);
        dispatch({
          type: SubmissionActionTypes.ASSIGN_PERMISSIONS
        });
        if (_.get(res, "data.message") === "Success") {
          Toast.success("Permissions Updated");
        }
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  assignFolderPermissions: data => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await SubmissionApi.assignFolderPermissions(data);
        dispatch({
          type: SubmissionActionTypes.ASSIGN_PERMISSIONS
        });
        if (_.get(res, "data.message") === "Success") {
          Toast.success("Permissions Updated");
        }
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  assignGlobalPermissions: data => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await SubmissionApi.assignGlobalPermissions(data);
        dispatch({
          type: SubmissionActionTypes.ASSIGN_PERMISSIONS
        });
        if (_.get(res, "data.message") === "Success") {
          Toast.success("Permissions Updated");
        }
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  findText: data => {
    return async dispatch => {
      ApiActions.request(dispatch);
      try {
        const res = await SubmissionApi.findText(data);
        dispatch({
          text: data.text,
          type: SubmissionActionTypes.FIND_TEXT,
          data: res.data
        });
        ApiActions.success(dispatch);
      } catch (err) {
        ApiActions.failure(dispatch);
      }
    };
  },
  findMatchBy: match => {
    return {
      type: SubmissionActionTypes.FIND_MATCH_BY,
      match
    };
  },
  findSortByTitle: () => {
    return {
      type: SubmissionActionTypes.FIND_SORT_BY_TITLE
    };
  },
  findSortByFile: () => {
    return {
      type: SubmissionActionTypes.FIND_SORT_BY_FILE
    };
  },
  findSelectedResult: selected => {
    return {
      type: SubmissionActionTypes.FIND_SELECTED_RESULT,
      selected
    };
  },
  resetFind: () => {
    return {
      type: SubmissionActionTypes.RESET_FIND
    };
  },
  clearSearchResults: () => {
    return {
      type: SubmissionActionTypes.CLEAR_SEARCH_RESULTS
    };
  }
};
