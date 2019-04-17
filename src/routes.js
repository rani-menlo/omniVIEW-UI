import React from "react";
import { Switch, BrowserRouter, Route, Redirect } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Redux from "./redux/store";
import LoginAuth1 from "./features/login/loginAuth1.component";
import SubmissionView from "./features/submission/submissionView.component";
import AuthenticationCode from "./features/login/authenticationCode.component";
import LoginContainer from "./features/login/login.container";
import ApplicationDashboardContainer from "./features/dashboard/application/applicationDashboard.container";
import CustomerDashboardContainer from "./features/dashboard/customer/customerDashboard.container";
import PrivateRoute from "./privateRoute";
import PdfViewer from "./features/pdfViewer/pdfViewer.component";
import Loader from "./uikit/components/loader";
import UserManagementContainer from "./features/usermanagement/userManagement.container";
import AddUser from "./features/usermanagement/adduser.component";
import AddCustomer from "./features/usermanagement/addCustomer.component";

const Routes = () => {
  return (
    <Provider store={Redux.store}>
      <PersistGate loading={<Loader loading />} persistor={Redux.persistor}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={LoginContainer} />
            <PrivateRoute
              exact
              path="/viewer/:type/:fileId?"
              component={PdfViewer}
            />
            <PrivateRoute path="/auth" component={LoginAuth1} />
            <PrivateRoute path="/verify/:mode" component={AuthenticationCode} />
            <PrivateRoute
              path="/customers"
              component={CustomerDashboardContainer}
            />
            <PrivateRoute
              path="/applications"
              component={ApplicationDashboardContainer}
            />
            <PrivateRoute path="/submission" component={SubmissionView} />
            <PrivateRoute
              exact
              path="/usermanagement"
              component={UserManagementContainer}
            />
            <PrivateRoute path="/usermanagement/add" component={AddUser} />
            <PrivateRoute path="/usermanagement/edit" component={AddUser} />
            <PrivateRoute
              path="/usermanagement/customer/add"
              component={AddCustomer}
            />
            <PrivateRoute
              path="/usermanagement/customer/edit"
              component={AddCustomer}
            />
            {/* <Redirect to="/" /> */}
          </Switch>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

export default Routes;
