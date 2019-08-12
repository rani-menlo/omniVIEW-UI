import Redux from "../store";
import _ from "lodash";
import { LoginActions } from "../actions";

const responseInterceptor = error => {
  const isLogout = _.includes(_.get(error, "request.responseURL"), "logout");
  const status = _.get(error, "response.status");
  if (!isLogout && status === 401) {
    Redux.store.dispatch(LoginActions.logOut("Session Expired!"));
    return;
  }
  if (status === 409) {
    Redux.store.dispatch(
      LoginActions.logOut(_.get(error, "response.data.message", ""))
    );
  }
};

export { responseInterceptor };
