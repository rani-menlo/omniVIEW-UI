import api from ".";
import { URI } from "../../constants";

export default {
  fetchApplicationsByList: (
    customerId,
    pageNo,
    itemsPerPage,
    sortBy,
    order,
    search
  ) => {
    return api.post(URI.GET_APPLICATIONS, {
      customerId,
      page: pageNo,
      limit: itemsPerPage,
      sortBy,
      order,
      search
    });
  },
  fetchApplications: (customerId, search) => {
    return api.post(URI.GET_APPLICATIONS, { customerId, search });
  },
  fetchAddApplication: () => {
    return api.post(URI.ADD_APPLICATION);
  },
  fetchAccessedApplications: data => {
    return api.post(URI.GET_ACCESSED_SUBMISSIONS, data);
  },
  fetchSubmissionCenters: () => {
    return api.get(URI.GET_SUBMISSION_CENTERS);
  },
  updateSubmissionCenter: data => api.post(URI.UPDATE_SUBMISSION_CENTER, data),
  saveFTPDetails: details => api.post(URI.SAVE_FTP_DETAILS, details),
  getFTPDetails: customerId =>
    api.get(URI.GET_FTP_DETAILS.replace("{customerId}", customerId)),
  getContentsOfPath: data => api.post(URI.GET_FTP_CONTENTS, data),
  isValidFTPSubmissionFolder: data => api.post(URI.IS_VALID_FOLDER, data),
  isValidFTPSequenceFolder: data =>
    api.post(URI.IS_VALID_SEQUENCE_FOLDER, data),
  getSubmissionLookupInfo: () => api.get(URI.SUBMISSION_LOOKUP_INFO),
  saveSubmissionDetails: data => api.post(URI.SAVE_SUBMISSION_DETAILS, data),
  saveSequenceDetails: data => api.post(URI.SAVE_SEQUENCE_DETAILS, data),
  monitorStatus: data => api.post(URI.MONITOR_STATUS, data),
  retryUploads: data => api.post(URI.RETRY_UPLOADS, data),
  deleteSubmission: data => api.post(URI.DELETE_SUBMISSION, data)
};
