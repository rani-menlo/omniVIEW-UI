import api from '.';
import { URI } from '../../constants';

export default {
  fetchApplications: id => {
    return api.post(URI.GET_APPLICATIONS, { id });
  }
};
