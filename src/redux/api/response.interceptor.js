import Redux from "../store";
import _ from 'lodash';
import { LoginActions } from "../actions";
import { message } from "antd";

const responseInterceptor = error => {
  if (_.get(error, "response.status") === 401) {
    message.error("Session Expired!");
    Redux.store.dispatch(LoginActions.logOut());
  }
};

export { responseInterceptor };
