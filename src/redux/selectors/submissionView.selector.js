import { createSelector } from "reselect";
import _ from "lodash";

const getSelectedCustomer = state => state.Customer.selectedCustomer;
const getSelectedSubmission = state => state.Application.selectedSubmission;
const getSelectedSequence = state => state.Submission.selectedSequence;
const getJsonSequence = state => state.Submission.sequenceJson;
const getLifeCycleData = state => state.Submission.lifeCycleJson;
const getSequencesList = state => state.Submission.sequences;

const getSequenceJson = createSelector(
  [
    getJsonSequence,
    getSelectedCustomer,
    getSelectedSubmission,
    getSelectedSequence
  ],
  (json, selectedCustomer, selectedSubmission, selectedSequence) => {
    const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
      selectedSubmission,
      "id",
      ""
    )}_${_.get(selectedSequence, "id", "")}`;
    return _.get(json, `${id}`);
  }
);

const getLifeCycleJson = createSelector(
  [getLifeCycleData, getSelectedCustomer, getSelectedSubmission],
  (json, selectedCustomer, selectedSubmission) => {
    const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
      selectedSubmission,
      "id",
      ""
    )}`;
    return _.get(json, `${id}`);
  }
);

const getSequences = createSelector(
  [getSequencesList, getSelectedCustomer, getSelectedSubmission],
  (json, selectedCustomer, selectedSubmission) => {
    const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
      selectedSubmission,
      "id",
      ""
    )}`;
    return _.get(json, `${id}`, []);
  }
);

export { getSequenceJson, getLifeCycleJson, getSequences };
