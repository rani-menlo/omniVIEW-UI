import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import { Text } from "../../uikit/components";

class PopoverCustomers extends Component {
  static propTypes = {
    onCustomerSelected: PropTypes.func
  };

  onCustomerSelected = customer => () => {
    const { selectedCustomer } = this.props;
    if (customer.id === selectedCustomer.id) {
      return;
    }
    this.props.onCustomerSelected && this.props.onCustomerSelected(customer);
  };

  render() {
    const {
      customers,
      user: { customer },
      selectedCustomer
    } = this.props;
    const sortedCustomers = _.sortBy(customers, cust => {
      return cust.id === customer.id ? 0 : 1;
    });
    return (
      <div className="popoverCustomers">
        {_.map(sortedCustomers, customer => (
          <Text
            className={`popoverCustomers-text ${selectedCustomer.id ===
              customer.id && "popoverCustomers-text-selected"}`}
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
    user: state.Login.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PopoverCustomers);
