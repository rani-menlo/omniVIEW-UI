import React from "react";
import { Switch, BrowserRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Login from "./features/login/login.component";
import LoginAuth1 from "./features/login/loginAuth1.component";
import SubmissionView from "./features/submission/submissionView.component";
import AuthenticationCode from "./features/login/authenticationCode.component";
import LoginContainer from "./features/login/login.container";
import ApplicationDashboardContainer from "./features/dashboard/application/applicationDashboard.container";
import CustomerDashboardContainer from "./features/dashboard/customer/customerDashboard.container";

const Routes = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          {/* <Route exact path="/" component={Login} /> */}
          <Route exact path="/" component={LoginContainer} />
          <Route path="/auth" component={LoginAuth1} />
          <Route path="/verify/:mode" component={AuthenticationCode} />
          <Route path="/customers" component={CustomerDashboardContainer} />
          <Route
            path="/applications/:customerId"
            component={ApplicationDashboardContainer}
          />
          <Route path="/submission" component={SubmissionView} />
        </Switch>
      </BrowserRouter>
    </Provider>
  );
};

export default Routes;
