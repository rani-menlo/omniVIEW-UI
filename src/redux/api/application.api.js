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
  }
};
