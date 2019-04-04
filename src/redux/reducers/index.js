import { combineReducers } from "redux";
import Api from "./api.reducer";
import Login from "./login.reducer";
import Customer from "./customer.reducer";
import Application from "./application.reducer";
import Submission from "./submission.reducer";
import Usermanagement from "./usermanagement.reducer";
import { LoginActionTypes } from "../actionTypes";

const appReducer = combineReducers({
  Api,
  Login,
  Customer,
  Application,
  Submission,
  Usermanagement
});

const RootReducer = (state, action) => {
  if (action.type === LoginActionTypes.LOGOUT) {
    state = undefined;
  }

  return appReducer(state, action);
};

export default RootReducer;
