import Redux from "../store";
import _ from "lodash";
import { LoginActions } from "../actions";
import { Toast } from "../../uikit/components";

const responseInterceptor = error => {
  const isLogout = _.includes(_.get(error, "request.responseURL"), "logout");
  if (!isLogout && _.get(error, "response.status") === 401) {
    Toast.error("Session Expired!");
    Redux.store.dispatch(LoginActions.logOut());
  }
};

export { responseInterceptor };
