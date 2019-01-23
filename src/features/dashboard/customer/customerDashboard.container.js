import React, { Component } from "react";
import _ from "lodash";
import { Icon, Input, message as MessageBox } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ListViewIcon from "../../../../assets/images/list-view.svg";
import ListViewIconActive from "../../../../assets/images/list-view-active.svg";
import FilterIcon from "../../../../assets/images/filter.svg";
import PlusIcon from "../../../../assets/images/plus.svg";
import SearchIcon from "../../../../assets/images/search.svg";
import CustomerCard from "../customerCard.component";
import { CustomerActions } from "../../../redux/actions";
import Header from "../../header.component";
import Loader from "../../../uikit/components/loader";

class CustomerDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: "cards"
    };
  }

  componentDidMount() {
    this.props.actions.fetchCustomers();
  }

  changeView = type => () => {
    this.setState({ viewBy: type });
  };

  onCustomerSelected = customer => () => {
    if (customer.id === 4) {
      MessageBox.error(
        `No Applications are available for customer ${customer.company_name}`
      );
      return;
    }
    this.props.actions.setSelectedCustomer(customer);
    this.props.history.push("/applications");
  };

  render() {
    const { viewBy } = this.state;
    const { customers, loading } = this.props;
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
            <div className="maindashboard__header__icon maindashboard__header__icon-filter">
              <img src={FilterIcon} />
            </div>
            <span className="maindashboard__header-filter-text">
              Filters: Off
            </span>
            <div className="maindashboard__header__search">
              <Input
                className="maindashboard__header__search-box"
                prefix={<img src={SearchIcon} style={{ marginLeft: "5px" }} />}
                placeholder="Search Customers..."
              />
            </div>
          </div>
          <div className="maindashboard__content">
            <div className="maindashboard__content__header">
              <span className="maindashboard__content__header-customers">
                Customers ({customers.length})
              </span>
              <span className="maindashboard__content__header-addcustomer">
                <img src={PlusIcon} />
                <span className="maindashboard__content__header-addcustomer--text">
                  Add New Customer{" "}
                </span>
              </span>
            </div>
            <div className="maindashboard__content__cards">
              {_.map(customers, customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onSelect={this.onCustomerSelected}
                />
              ))}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    customers: state.Customer.customers
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...CustomerActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerDashboard);
