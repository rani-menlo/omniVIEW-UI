import api from ".";
import { URI } from "../../constants";

export default {
  fetchCustomersByList: (pageNo, itemsPerPage, sortBy, order, search) => {
    return api.get(URI.GET_CUSTOMERS, {
      params: {
        page: pageNo,
        limit: itemsPerPage,
        sortBy,
        order,
        search
      }
    });
  },
  fetchCustomers: search => {
    return api.get(URI.GET_CUSTOMERS, {
      params: {
        search
      }
    });
  },
  fetchCustomersByUserId: data => {
    return api.post(URI.GET_ACCESSED_CUSTOMERS, data);
  },
  getCustomerById: customerId =>
    api.get(URI.GET_CUSTOMER.replace(":customerId", customerId)),
  addCustomer: customer => api.post(URI.ADD_CUSTOMER, customer),
  editCustomer: customer => api.post(URI.EDIT_CUSTOMER, customer),
  activateDeactivateCustomer: customer =>
    api.post(URI.ACTIVATE_DEACTIVATE_CUSTOMER, customer),
  getSubscriptionsInUse: customerId =>
    api.post(URI.GET_SUBSCRIPTIONS_IN_USE, { customerId }),
  getLicenceLookUps: () => api.get(URI.GET_LICENCE_LOOKUP_INFO),
  addNewLicences: data => api.post(URI.ADD_NEW_LICENCES, data)
};
