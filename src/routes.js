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

const Routes = () => {
  return (
    <Provider store={Redux.store}>
      <PersistGate loading={<Loader loading />} persistor={Redux.persistor}>
        {/* <BrowserRouter basename={"/qa"}> */}
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={LoginContainer} />
            <Route exact path="/qa" component={LoginContainer} />
            <PrivateRoute exact path="/qa/viewer/:type/:fileId?" component={PdfViewer} />
            <PrivateRoute exact path="/viewer/:type/:fileId?" component={PdfViewer} />
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
            {/* <Redirect to="/" /> */}
          </Switch>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

export default Routes;
