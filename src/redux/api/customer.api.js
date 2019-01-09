import api from '.';
import { URI } from '../../constants';

export default {
  fetchCustomers: () => {
    return api.get(URI.GET_CUSTOMERS);
  }
};
