import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import { Text } from "../../uikit/components";
import { CustomerActions } from "../../redux/actions";
import { bindActionCreators } from "redux";

class PopoverCustomers extends Component {
  static propTypes = {
    onCustomerSelected: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedCustomer: this.props.selectedCustomer,
    };
  }

  onCustomerSelected = (customer) => () => {
    const { selectedCustomer } = this.state;
    // if (customer.id === selectedCustomer.id) {
    //   return;
    // }
    this.setState({ selectedCustomer: customer });
    this.props.onCustomerSelected && this.props.onCustomerSelected(customer);
  };

  /**
   * Fetching customers
   * @param {*} sortBy
   * @param {*} orderBy
   */
  fetchCustomers = (sortBy = "created_at", orderBy = "DESC") => {
    this.props.dispatch(CustomerActions.resetCustomers());
    let searchText = "";
    this.props.actions.fetchCustomers(searchText);
  };

  componentDidMount() {
    // this.fetchCustomers();
    if (this.props.showAll) {
      let allCustomersObj = {
        id: 0,
        company_name: "All Customers",
      };
      this.setState({ selectedCustomer: allCustomersObj });
    }
  }

  render() {
    const { customers, customer, showAll, selectedUploadedCustomer } = this.props;
    const { selectedCustomer } = this.state;
    const sortedCustomers = _.sortBy(customers, (cust) => {
      return cust.id === customer.id ? 0 : 1;
    });
    if (showAll) {
      let allCustomersObj = {
        id: 0,
        company_name: "All Customers",
      };
      sortedCustomers.splice(0, 0, allCustomersObj);
    }
    return (
      <div className="popoverCustomers">
        {_.map(sortedCustomers, (customer) => (
          <Text
            className={`popoverCustomers-text ${(selectedCustomer.id ||
              selectedUploadedCustomer.id) === customer.id &&
              "popoverCustomers-text-selected"}`}
            key={customer.id}
            type="extra_bold"
            size="20px"
            text={customer.company_name}
            onClick={this.onCustomerSelected(customer)}
          />
        ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    customers: state.Customer.customers,
    selectedCustomer: state.Customer.selectedCustomer,
    selectedUploadedCustomer: state.Customer.selectedUploadedCustomer,
    user: state.Login.user,
    customer: state.Login.customer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...CustomerActions }, dispatch),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PopoverCustomers);
