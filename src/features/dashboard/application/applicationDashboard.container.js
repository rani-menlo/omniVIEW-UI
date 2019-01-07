import React, { Component } from "react";
import { Icon, Input } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ListViewIcon from "../../../../assets/images/list-view.svg";
import FilterIcon from "../../../../assets/images/filter.svg";
import PlusIcon from "../../../../assets/images/plus.svg";
import SearchIcon from "../../../../assets/images/search.svg";
import CustomerCard from "../customerCard.component";
import { ApplicationActions } from "../../../redux/actions";
// import { Customers } from "./sampleCustomers";

class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards"
    };
  }

  componentDidMount() {
    const { customerId } = this.props.match.params;
    this.props.actions.fetchApplications(customerId);
  }

  changeView = type => () => {
    this.setState({ viewBy: type });
  };

  render() {
    const { viewBy } = this.state;
    const { submissions } = this.props;
    return (
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
            <img src={ListViewIcon} />
          </div>
          <div className="maindashboard__header__icon maindashboard__header__icon-filter">
            <img src={FilterIcon} />
          </div>
          <span className="maindashboard__header-filter-text">
            Filters: Off
          </span>
          <div className="maindashboard__header__search">
            <Input
              className="maindashboard__header__search-box"
              prefix={<img src={SearchIcon} />}
              placeholder="Search Applications..."
            />
          </div>
        </div>
        <div className="maindashboard__content">
          <div className="maindashboard__content__header">
            <span className="maindashboard__content__header-customers">
              Customers ({submissions.length})
            </span>
            <span className="maindashboard__content__header-addcustomer">
              <img src={PlusIcon} />
              <span className="maindashboard__content__header-addcustomer--text">
                Add New Application{" "}
              </span>
            </span>
          </div>
          <div className="maindashboard__content__cards">
            {_.map(submissions,  submission=> (
              <CustomerCard customer={submission} type="customer"/>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    submissions: state.Application.submissions
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
