import React from 'react';
import { Switch, BrowserRouter, Route } from "react-router-dom";
import Login from "./features/login/login.component";
import LoginAuth1 from "./features/login/loginAuth1.component";
import SubmissionView from "./features/submission/submissionView.component";

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/auth1" component={LoginAuth1} />
        <Route path="/submission" component={SubmissionView} />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
