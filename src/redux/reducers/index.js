import { combineReducers } from 'redux';
import Api from './api.reducer';
import Login from './login.reducer';
import Customer from './customer.reducer';
import Application from './application.reducer';
import Submission from './submission.reducer';

export default combineReducers({
  Api,
  Login,
  Customer,
  Application,
  Submission
});
