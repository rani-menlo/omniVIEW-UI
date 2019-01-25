import React, { Component } from "react";
import _ from "lodash";
import { Icon, Input } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ListViewIcon from "../../../../assets/images/list-view.svg";
import ListViewIconActive from "../../../../assets/images/list-view-active.svg";
import FilterIcon from "../../../../assets/images/filter.svg";
import PlusIcon from "../../../../assets/images/plus.svg";
import SearchIcon from "../../../../assets/images/search.svg";
import SubmissionCard from "../submissionCard.component";
import { ApplicationActions } from "../../../redux/actions";
import Loader from "../../../uikit/components/loader";
import Header from "../../header.component";
import Footer from "../../../uikit/components/footer/footer.component";
// import { Customers } from "./sampleCustomers";

class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards"
    };
  }

  componentDidMount() {
    const { selectedCustomer } = this.props;
    selectedCustomer &&
      this.props.actions.fetchApplications(selectedCustomer.id);
  }

  changeView = type => () => {
    this.setState({ viewBy: type });
  };

  onSubmissionSelected = submission => () => {
    this.props.actions.setSelectedSubmission(submission);
    this.props.history.push("/submission");
  };

  openCustomersScreen = () => {
    this.props.history.goBack();
  };

  render() {
    const { viewBy } = this.state;
    const { submissions, loading, selectedCustomer } = this.props;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header />
        <div className="maindashboard">
          <div className="maindashboard__header">
            <div
              className={`maindashboard__header__icon maindashboard__header__icon-cards ${viewBy ===
                "cards" && "maindashboard__header__icon-selected"}`}
              onClick={this.changeView("cards")}
            >
              <Icon
                type="appstore"
                theme="filled"
                className={`card-icon ${viewBy === "cards" &&
                  "card-icon-colored"}`}
              />
            </div>
            <div
              className={`maindashboard__header__icon maindashboard__header__icon-lists ${viewBy ===
                "lists" && "maindashboard__header__icon-selected"}`}
              onClick={this.changeView("lists")}
            >
              <img
                src={viewBy === "lists" ? ListViewIconActive : ListViewIcon}
              />
            </div>
            {/* <div className="maindashboard__header__icon maindashboard__header__icon-filter">
              <img src={FilterIcon} />
            </div>
            <span className="maindashboard__header-filter-text">
              Filters: Off
            </span> */}
            <div className="maindashboard__header__search">
              <Input
                className="maindashboard__header__search-box"
                prefix={<img src={SearchIcon} style={{ marginLeft: "5px" }} />}
                placeholder="Search Applications..."
              />
            </div>
          </div>
          <div className="maindashboard__content">
            <span
              className="maindashboard__content-breadcrum"
              onClick={this.openCustomersScreen}
            >
              Customers
            </span>
            <span style={{ margin: "0px 5px" }}>></span>
            <span
              className="maindashboard__content-breadcrum"
              style={{ opacity: 0.4, cursor: "default" }}
            >
              Applications
            </span>
            <div className="maindashboard__content__header">
              <div>
                <span className="maindashboard__content__header-customers">
                  {_.get(selectedCustomer, "company_name", "")}
                </span>
                <div className="maindashboard__content__header__addEdit">
                  Add/Edit Users
                </div>
              </div>
              <span className="maindashboard__content__header-addcustomer">
                <img src={PlusIcon} />
                <span className="maindashboard__content__header-addcustomer--text">
                  Add New Application{" "}
                </span>
              </span>
            </div>
            <div className="maindashboard__content__cards">
              {_.map(submissions, submission => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onSelect={this.onSubmissionSelected}
                />
              ))}
            </div>
          </div>
          <Footer />
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    submissions: state.Application.submissions,
    selectedCustomer: state.Customer.selectedCustomer
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...ApplicationActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationDashboard);
