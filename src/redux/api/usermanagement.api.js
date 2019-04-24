import api from ".";
import { URI } from "../../constants";

export default {
  fetchDepartments: () => api.get(URI.GET_DEPARTMENTS),
  fetchLicences: customerId => api.post(URI.GET_LICENCES, { customerId }),
  fetchAllLicences: () => api.get(URI.GET_ALL_LICENCES),
  addUser: user => api.post(URI.ADD_USER, user),
  updateUser: user => api.post(URI.UPDATE_USER, user),
  addCustomer: customer => api.post(URI.ADD_CUSTOMER, customer),
  editCustomer: customer => api.post(URI.EDIT_CUSTOMER, customer),
  activateDeactivateUser: user => api.post(URI.ACTIVATE_DEACTIVATE, user),
  fetchUsers: data => api.post(URI.GET_USERS, data)
};
