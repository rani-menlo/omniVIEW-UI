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
  activateDeactivateCustomer: customer =>
    api.post(URI.ACTIVATE_DEACTIVATE_CUSTOMER, customer)
};
