import api from ".";
import { URI } from "../../constants";

export default {
  fetchDepartments: () => api.get(URI.GET_DEPARTMENTS),
  fetchAvailableLicences: customerId =>
    api.post(URI.GET_AVAILABLE_LICENCES, { customerId }),
  fetchAllLicences: customerId =>
    api.get(URI.GET_ALL_LICENCES.replace(":customer_id", customerId)),
  getLicenseInfo: () => api.get(URI.GET_LICENSE_INFO),
  assignLicense: data => api.post(URI.ASSIGN_LICENSE, data),
  revokeLicense: data => api.post(URI.REVOKE_LICENSE, data),
  requestLicense: () => api.post(URI.REQUEST_LICENSE),
  addUser: user => api.post(URI.ADD_USER, user),
  updateUser: user => api.post(URI.UPDATE_USER, user),
  activateDeactivateUser: user => api.post(URI.ACTIVATE_DEACTIVATE, user),
  deleteUser: data => api.post(URI.DELETE_USER, data),
  updateSecondaryContacts: data =>
    api.post(URI.UPDATE_SECONDARY_CONTACTS, data),
  fetchUsers: data => api.post(URI.GET_USERS, data),
  fetchUsersOfSubmissions: data => api.post(URI.GET_USERS_OF_SUBMISSIONS, data),
  fetchUsersOfFiles: data => api.post(URI.GET_USERS_OF_FILES, data),
  resendInvitationMail: data => api.post(URI.RESEND_INVITATION_MAIL, data)
};
