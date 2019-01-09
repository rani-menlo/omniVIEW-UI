import api from '.';
import { URI } from '../../constants';

export default {
  fetchSequences: data => {
    return api.post(URI.GET_SEQUENCES, data);
  },
  fetchJson: data => {
    return api.post(URI.GET_JSON, data);
  }
};
