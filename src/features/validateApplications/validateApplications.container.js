import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Header from "../header/header.component";
import {
  Loader,
  ContentLayout,
  Row,
  Text,
  SubHeader,
} from "../../uikit/components";
import { Popover } from "antd";
// import PopoverCustomers from "./userManagement/";
import { isLoggedInOmniciaAdmin } from "../../utils";
import { get, find, memoize } from "lodash";
import { CustomerActions } from "../../redux/actions";
import styled from "styled-components";
import { translate } from "../../translations/translator";

class ValidateApplications extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * On customer selection in the subheader
   * @param {*} customer
   */
  onCustomerSelected = (customer) => {
    this.props.dispatch(CustomerActions.setSelectedCustomer(customer));
    // const omniciaRoles = _.map(ROLES.OMNICIA, "id");
    // const customerRoles = _.map(ROLES.CUSTOMER, "id");
    // const roles = _.get(customer, "is_omnicia", false)
    //   ? omniciaRoles
    //   : customerRoles;

    // if (this.selectedFilters.roles) {
    //   const diff = _.difference(this.selectedFilters.roles, roles);
    //   if (diff.length) {
    //     this.selectedFilters.roles = _.map(this.selectedFilters.roles, (role) =>
    //       role < 4 ? role + 3 : role - 3
    //     );
    //   }
    // }
    this.setState({ pageNo: 1 }, () => this.fetchUsers(customer));
  };

  render() {
    const { loading, selectedCustomer } = this.props;
    return (
      <>
        <Loader loading={loading} />
        <Header />
        <SubHeader>
          {isLoggedInOmniciaAdmin(this.props.role) && (
            <Popover
              trigger="click"
              placement="bottom"
              // content={
              //   <PopoverCustomers
              //     onCustomerSelected={this.onCustomerSelected}
              //   />
              // }
            >
              <Row style={{ marginLeft: "auto" }}>
                <Text
                  type="extra_bold"
                  size="20px"
                  className="userManagement-subheader-title"
                  text={selectedCustomer.company_name}
                />
                <img
                  className="global__cursor-pointer"
                  src="/images/caret-inactive.svg"
                  style={{ marginLeft: "5px" }}
                />
              </Row>
            </Popover>
          )}
        </SubHeader>
        <ContentLayout className="validate-applications-layout"></ContentLayout>
      </>
    );
  }
}

const getColumnWidth = memoize((name) => {
  const col = find(TableColumns, (col) => col.name === name);
  return get(col, "width");
});

const Column = styled.div`
  width: ${(props) => props.width};
`;

const TableColumnNames = {
  CUSTOMER: translate("label.dashboard.customer"),
  APPLICATION: translate("label.dashboard.application"),
  NOOFSEQUENCES: translate("label.dashboard.noOfSequences"),
  ERRORS: translate("text.generic.errors"),
  APPLICATIONSTATUS: translate("label.dashboard.applicationStatus"),
};

const TableColumns = [
  {
    name: TableColumnNames.CUSTOMER,
    key: "type_name",
    sort: true,
    width: "20%",
  },
  {
    name: TableColumnNames.APPLICATION,
    key: "duration",
    sort: true,
    width: "20%",
  },
  {
    name: TableColumnNames.NOOFSEQUENCES,
    key: "expired_date",
    sort: true,
    width: "20%",
  },
  {
    name: TableColumnNames.ERRORS,
    key: "first_name",
    width: "20%",
  },
  {
    name: TableColumnNames.APPLICATIONSTATUS,
    key: "first_name",
    width: "15%",
  },
];

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    selectedCustomer: state.Customer.selectedCustomer,
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
)(ValidateApplications);
