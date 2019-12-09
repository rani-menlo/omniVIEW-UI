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
import CreateProfile from "./features/profile/createProfile.component";
import ForgotPassword from "./features/forgotpwd/forgotpwd.component";
import ResetPassword from "./features/forgotpwd/resetPassword.component";
import SubscriptionsPage from "./features/license/subscriptionsPage.component";
import RequestLicense from "./features/license/requestLicence.component";
import AddNewApplication from "./features/dashboard/application/addNewApplication.container";
import RemoteDetails from "./features/dashboard/application/remoteDetails.component";

const Routes = () => {
  return (
    <Provider store={Redux.store}>
      <PersistGate loading={<Loader loading />} persistor={Redux.persistor}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={LoginContainer} />
            <Route exact path="/forgotpwd" component={ForgotPassword} />
            <Route exact path="/resetPassword/:key" component={ResetPassword} />
            <Route exact path="/requestlicense" component={RequestLicense} />
            <Route
              exact
              path="/applications/add"
              component={AddNewApplication}
            />
            <Route
              exact
              path="/sequences/add"
              component={AddNewApplication}
            />
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
              key="usermanagement"
              exact
              path="/usermanagement"
              component={UserManagementContainer}
            />
            <PrivateRoute
              key="usermanagement/parent"
              exact
              path="/usermanagement/parent"
              component={UserManagementContainer}
            />
            <PrivateRoute path="/usermanagement/add" component={AddUser} />
            <PrivateRoute path="/usermanagement/edit" component={AddUser} />
            <PrivateRoute
              path="/usermanagement/customer/add"
              exact
              component={AddCustomer}
            />
            <PrivateRoute
              path="/usermanagement/customer/edit"
              exact
              component={AddCustomer}
            />
            <PrivateRoute
              path="/usermanagement/customer/edit/subscriptions"
              exact
              component={AddCustomer}
            />
            <PrivateRoute exact path="/profile" component={CreateProfile} />
            <PrivateRoute
              exact
              path="/profile/edit"
              component={CreateProfile}
            />
            <PrivateRoute
              exact
              path="/subscriptions"
              component={SubscriptionsPage}
            />
            <Redirect to="/" />
          </Switch>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

export default Routes;
