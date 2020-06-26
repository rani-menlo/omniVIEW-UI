import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { CustomerActions, LoginActions } from "../../redux/actions";
import Header from "../header/header.component";
import { Loader, OmniButton, ContentLayout } from "../../uikit/components";
import { Row, Col, Radio } from "antd";
import { translate } from "../../translations/translator";
import { get, map } from "lodash";
import { isLoggedInOmniciaRole } from "../../utils";

const RadioGroup = Radio.Group;

const radioStyle = {
  display: "block",
  lineHeight: "30px",
};

class CustomerAccounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCustomer: "",
    };
  }

  getCustomerAccounts = () => {
    this.props.dispatch(LoginActions.fetchCustomerAccounts());
  };

  onBackButtonEvent = (e) => {
    e.preventDefault();
    if (!this.isBackButtonClicked) {
      window.history.pushState(null, null, window.location.pathname);
      this.isBackButtonClicked = false;
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener("popstate", this.onBackButtonEvent);
  };

  componentDidMount() {
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", this.onBackButtonEvent);
    this.getCustomerAccounts();
  }

  selectCustomer = (e) => {
    let { value } = e.target;
    this.setState({ selectedCustomer: e.target.value });
  };

  openCustApplications = () => {
    const { selectedCustomer } = this.state;
    const { role, props, customer } = this.props;
    this.props.dispatch(CustomerActions.setSelectedCustomer(selectedCustomer));
    let postObj = { customerId: selectedCustomer.id };
    this.props.dispatch(
      LoginActions.switchCustomerAccounts(postObj, () => {
        if (this.props.invalid_license) {
          this.props.history.push("/requestlicense");
          return;
        }

        if (this.props.first_login) {
          this.props.history.push("/profile");
          return;
        }

        if (isLoggedInOmniciaRole(role)) {
          this.props.history.push("/customers");
          return;
        }
        this.props.dispatch(CustomerActions.setSelectedCustomer(customer));
        this.props.history.push("/applications");
      })
    );
  };

  render() {
    const { customerProfileAccounts, loading } = this.props;
    const { selectedCustomer } = this.state;
    console.log("customerAccounts", customerProfileAccounts);
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header disabled hideMenu />
        <ContentLayout className="customer-accounts-layout">
          <h3 class="select-customer">
            {translate("text.customer.viewCustomer")}
          </h3>
          <Row align="middle" justify="center" type="flex">
            <Col xs={12} md={12} lg={6} xl={6}>
              <div className="customer-accounts">
                {get(customerProfileAccounts, "length") && (
                  <Row align="middle" justify="center" type="flex" className="">
                    <RadioGroup
                      value={selectedCustomer}
                      onChange={this.selectCustomer}
                    >
                      {map(customerProfileAccounts, (profile) => (
                        <Radio
                          key={profile.customerId}
                          style={radioStyle}
                          className="global__radio"
                          value={profile.customer}
                        >
                          {get(profile, "companyName", "N/A")}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </Row>
                )}
              </div>
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <OmniButton
                  label={translate("label.button.continue")}
                  onClick={this.openCustApplications}
                  disabled={!selectedCustomer}
                />
              </div>
            </Col>
          </Row>
        </ContentLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    user: state.Login.user,
    first_login: state.Login.first_login,
    customer: state.Login.customer,
    customerProfileAccounts: state.Login.customerProfileAccounts,
    invalid_license: state.Login.invalid_license,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators({ ...CustomerActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerAccounts);
