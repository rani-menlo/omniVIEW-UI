import { createSelector } from "reselect";
import _ from "lodash";

const getSubmissions = state => state.Application.submissions;
const getSelectedCustomer = state => state.Customer.selectedCustomer;

const getSubmissionsByCustomer = createSelector(
  [getSubmissions, getSelectedCustomer],
  (submissions, selectedCustomer) => {
    return _.get(submissions, `[${_.get(selectedCustomer, "id", "")}]`, []);
  }
);

export { getSubmissionsByCustomer };
