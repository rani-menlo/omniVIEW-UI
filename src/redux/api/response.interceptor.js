import Redux from "../store";
import { LoginActions } from "../actions";
import { message } from "antd";

const responseInterceptor = error => {
  if (error.response.status === 401) {
    message.error("Session Expired!");
    Redux.store.dispatch(LoginActions.logOut());
  }
};

export { responseInterceptor };
