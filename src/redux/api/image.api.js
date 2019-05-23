import api from ".";
import { URI } from "../../constants";

export default {
  fetchImage: profilepath => {
    return api.post(URI.PROFILE_IMAGE, { profilepath });
  }
};
