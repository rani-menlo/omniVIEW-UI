import { createSelector } from "reselect";
import _ from "lodash";

const getSelectedCustomer = state => state.Customer.selectedCustomer;
const getSelectedSubmission = state => state.Application.selectedSubmission;
const getValidations = state => state.Submission.validations;
const getSelectedSequence = (state, props) => props.sequence;

const getValidationsBySequence = createSelector(
  [
    getValidations,
    getSelectedCustomer,
    getSelectedSubmission,
    getSelectedSequence
  ],
  (validations, selectedCustomer, selectedSubmission, selectedSequence) => {
    const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
      selectedSubmission,
      "id",
      ""
    )}_${_.get(selectedSequence, "id", "")}`;
    return _.get(validations, `${id}`, []);
  }
);

export { getValidationsBySequence };
