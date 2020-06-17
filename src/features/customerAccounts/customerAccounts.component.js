import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { CustomerActions } from "../../redux/actions";
import Header from "../header/header.component";
import { Loader, OmniButton } from "../../uikit/components";
import { Row, Col, Radio } from "antd";
import { translate } from "../../translations/translator";
import { get, map } from "lodash";

const RadioGroup = Radio.Group;

const radioStyle = {
  display: "block",
  lineHeight: "30px",
};

class CustomerAccounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customerAccountsList: [
        { id: 1, name: "Acme" },
        { id: 2, name: "FDA" },
        { id: 3, name: "Biorx" },
      ],
      selectedCustomer: "",
    };
  }

  getCustomerAccounts = () => {
    this.props.actions.fetchCustomerAccounts();
  };

  componentDidMount() {
    this.getCustomerAccounts();
  }

  selectCustomer = (e) => {
    this.setState({ selectedCustomer: e.target.value });
  };

  openCustApplications = () => {
    const { selectCustomer } = this.state;
    // this.props.actions.setSelectedCustomer(selectCustomer);
    this.props.history.push("/applications");
  };

  render() {
    const { customerAccounts, loading } = this.props;
    const { customerAccountsList, selectedCustomer } = this.state;
    console.log("customerAccounts", customerAccounts);
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header disabled hideMenu />
        <Row align="middle" justify="center" type="flex">
          <Col xs={12} md={12} lg={6} xl={6}>
            <div className="customer-accounts">
              <h3>{translate("text.customer.viewCustomer")}</h3>
              {get(customerAccountsList, "length") && (
                <Row align="middle" justify="center" type="flex" className="">
                  <RadioGroup
                    value={selectedCustomer}
                    onChange={this.selectCustomer}
                  >
                    {map(customerAccountsList, (customer) => (
                      <Radio
                        key={customer.id}
                        style={radioStyle}
                        className="global__radio"
                        value={customer}
                      >
                        {customer.name}
                      </Radio>
                    ))}
                  </RadioGroup>
                </Row>
              )}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <OmniButton
                  label={translate("label.button.continue")}
                  onClick={this.openCustApplications}
                  disabled={!selectedCustomer}
                />
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    user: state.Login.user,
    customerAccounts: state.Customer.customerAccounts,
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
)(CustomerAccounts);
