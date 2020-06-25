import React, { Component } from "react";
import { isLoggedInOmniciaRole } from "./utils";
import _ from "lodash";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import "./stylesheets/main.scss";
import Routes from "./routes";
import * as serviceWorker from "./serviceWorker";
import { SERVER_URL } from "./constants";
import { CustomerActions } from "./redux/actions";

// const App = () => <Routes />;

// //disabling browser back button
// // window.history.pushState(null, null, null);
// window.onpopstate = function(event) {
//   console.log(
//     "onpopstate",
//     event.state,
//     !event.state,
//     event,
//     `${SERVER_URL}/verify/email`
//   );
//   let url = window.location.href == `${SERVER_URL}/verify/email` ? true : false;
//   let token = localStorage.getItem("omniview_user_token") ? true : false;
//   if (url && token) {
//     event.preventDefault();
//     window.history.pushState(
//       event.state,
//       document.title,
//       `${SERVER_URL}/customers`
//     );
//     return;
//   }
// };

class App extends Component {
  // componentDidMount() {
  //   window.onpopstate = function(event) {
  //     console.log(
  //       "onpopstate",
  //       event.state,
  //       !event.state,
  //       event,
  //       `${SERVER_URL}/verify/email`
  //     );
  //     let url =
  //       window.location.href == `${SERVER_URL}/verify/email` ? true : false;
  //     let token = localStorage.getItem("omniview_user_token") ? true : false;
  //     if (url && token) {
  //       let { customerAccounts, role } = this.props;
  //       event.preventDefault();
  //       // if (customerAccounts && customerAccounts.length > 1) {
  //       //   window.history.pushState(
  //       //     event.state,
  //       //     document.title,
  //       //     `${SERVER_URL}/customer-accounts`
  //       //   );
  //       //   return;
  //       // } else {
  //       //   let obj = {
  //       //     customerId: _.get(customerAccounts[0].customer, "id"),
  //       //   };
  //       //   this.props.actions.switchCustomerAccounts(obj, () => {
  //       //     if (isLoggedInOmniciaRole(customerAccounts[0].role)) {
  //       //       window.history.pushState(
  //       //         event.state,
  //       //         document.title,
  //       //         `${SERVER_URL}/customers`
  //       //       );
  //       //       return;
  //       //     }
  //       //     this.props.dispatch(
  //       //       CustomerActions.setSelectedCustomer(customerAccounts[0].customer)
  //       //     );
  //       //     window.history.pushState(
  //       //       event.state,
  //       //       document.title,
  //       //       `${SERVER_URL}/applications`
  //       //     );
  //       //     return;
  //       //   });
  //       // }

  //       if (isLoggedInOmniciaRole(role)) {
  //         window.history.pushState(
  //           event.state,
  //           document.title,
  //           `${SERVER_URL}/customers`
  //         );
  //         return;
  //       }
  //       window.history.pushState(
  //         event.state,
  //         document.title,
  //         `${SERVER_URL}/applications`
  //       );
  //       return;
  //     }
  //   };
  // }
  render() {
    return <Routes />;
  }
}

function mapStateToProps(state) {
  return {
    customerAccounts: state.Login.customerAccounts,
    role: state.Login.role,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

ReactDOM.render(<App />, document.getElementById("root"));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
