import api from ".";
import { URI } from "../../constants";

export default {
  fetchSequences: data => {
    return api.post(URI.GET_SEQUENCES, data);
  },
  fetchSequencesWithPermissions: data => {
    return api.post(URI.GET_SEQUENCES_WITH_PERMISSIONS, data);
  },
  fetchJson: data => {
    return api.get(URI.GET_JSON_WITH_PERMISSION, { params: { ...data } });
  },
  /* fetchJsonWithPermissions: data => {
    return api.get(URI.GET_JSON_WITH_PERMISSION, { params: { ...data } });
  }, */
  validateSquence: id => {
    return api.post(URI.VALIDATE_SEQUENCE, id);
  },
  assignFilePermissions: data => {
    return api.post(URI.ASSIGN_FILE_PERMISSIONS, data);
  },
  assignSubmissionPermissions: data => {
    return api.post(URI.ASSIGN_SUBMISSION_PERMISSIONS, data);
  },
  updateOmniciaUserPermissions: data => {
    return api.post(URI.UPDATE_PERMISSIONS, data);
  },
  assignFolderPermissions: data => {
    return api.post(URI.ASSIGN_FOLDER_PERMISSIONS, data);
  },
  assignSequencePermissions: data => {
    return api.post(URI.ASSIGN_SEQUENCE_PERMISSIONS, data);
  },
  assignGlobalPermissions: data => {
    return api.post(URI.ASSIGN_GLOBAL_PERMISSIONS, data);
  },
  findText: data => {
    return api.post(URI.FIND_TEXT, data);
  }
};
