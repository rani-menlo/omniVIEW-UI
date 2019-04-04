import React, { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import {
  Loader,
  ContentLayout,
  InputField,
  PhoneField,
  Row,
  OmniButton,
  NumericInput
} from "../../uikit/components";
import Header from "../header/header.component";
import { Checkbox } from "antd";
import { UsermanagementActions } from "../../redux/actions";
import { isPhone, isEmail } from "../../utils";

class AddCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cname: {
        value: "",
        error: ""
      },
      fname: {
        value: "",
        error: ""
      },
      lname: {
        value: "",
        error: ""
      },
      email: {
        value: "",
        error: ""
      },
      phone: {
        value: "",
        error: ""
      },
      storageTB: 0,
      storageGB: 0,
      storageError: "",
      storageApplications: {
        value: 0,
        error: ""
      },
      subscription: {
        omniView: true,
        omniFile: false
      },
      licences: {
        omniView: {},
        omniFile: {},
        omniViewError: "",
        omniFileError: ""
      }
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (
      !_.size(state.licences.omniView) &&
      !_.size(state.licences.omniFile) &&
      props.allLicences.length
    ) {
      const licenceObj = {};
      _.map(props.allLicences, licence => {
        licenceObj[licence.slug] = 0;
      });
      return {
        licences: {
          ...state.licences,
          omniView: licenceObj,
          omniFile: licenceObj
        }
      };
    }
    return null;
  }

  componentDidMount() {
    this.props.dispatch(UsermanagementActions.getAllLicences());
  }

  onInputChange = field => e => {
    const { value } = e.target;
    this.setState({
      [field]: { ...this.state[field], value, error: "" }
    });
  };

  onStorageChange = field => e => {
    const { value } = e.target;
    console.log(value, field);
    this.setState({
      [field]: value,
      storageError: ""
    });
  };

  onPhoneChange = value => {
    this.setState({ phone: { ...this.state.phone, value, error: "" } });
  };

  onSubscriptionChecked = e => {
    const { value, checked } = e.target;

    let otherCheckbox = false;
    if (value === "omniView") {
      otherCheckbox = this.state.subscription.omniFile;
    } else {
      otherCheckbox = this.state.subscription.omniView;
    }

    if (!checked && !otherCheckbox) {
      return;
    }

    this.setState({
      subscription: { ...this.state.subscription, [value]: checked }
    });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  save = () => {
    const state = { ...this.state };
    let error = false;
    if (!state.cname.value) {
      error = true;
      state.cname.error = "Company Name is required";
      window.scrollTo(0, 0);
    }
    if (!state.fname.value) {
      error = true;
      state.fname.error = "First Name is required";
      window.scrollTo(0, 0);
    }
    if (!state.lname.value) {
      error = true;
      state.lname.error = "Last Name is required";
      window.scrollTo(0, 0);
    }
    if (state.email.value) {
      const valid = isEmail(state.email.value);
      if (!valid) {
        error = true;
        state.email.error = "Enter valid email";
        window.scrollTo(0, 0);
      }
    } else {
      error = true;
      state.email.error = "Email is required";
      window.scrollTo(0, 0);
    }
    if (state.phone.value) {
      const valid = isPhone(state.phone.value);
      if (!valid) {
        error = true;
        state.phone.error = "Enter valid Phone";
        window.scrollTo(0, 0);
      }
    } else {
      error = true;
      state.phone.error = "Phone is required";
    }
    const storage = Number(state.storageTB) + Number(state.storageGB);
    if (storage === 0) {
      error = true;
      state.storageError = "Enter storage";
    }

    if (!state.storageApplications.value) {
      error = true;
      state.storageApplications.error = "Enter applications";
    }
    if (state.subscription.omniView) {
      const values = _.values(state.licences.omniView);
      if (this.hasAllZeros(values)) {
        error = true;
        state.licences.omniViewError = "Enter atleast one licence";
      }
    }
    if (state.subscription.omniFile) {
      const values = _.values(state.licences.omniFile);
      if (this.hasAllZeros(values)) {
        error = true;
        state.licences.omniFileError = "Enter atleast one licence";
      }
    }

    if (error) {
      this.setState(state);
      return;
    }

    const application_access = [];
    state.subscription.omniView && application_access.push("omniView");
    state.subscription.omniFile && application_access.push("omniFile");

    let reqObject = {
      application_access,
      customerName: state.cname.value,
      first_name: state.fname.value,
      last_name: state.lname.value,
      email: state.email.value,
      phone: state.phone.value,
      tbSpace: state.storageTB || 0,
      gbSpace: state.storageGB || 0,
      max_apps: state.storageApplications.value,
      subscriptions: {
        "omni-view": {
          ...state.licences.omniView
        },
        "omni-file": {
          ...state.licences.omniFile
        }
      }
    };
    this.props.dispatch(
      UsermanagementActions.addCustomer(reqObject, this.props.history)
    );
  };

  hasAllZeros = values => {
    return _.every(values, value => _.toNumber(value) === 0);
  };

  onLicenceValueChange = (type, licence) => e => {
    this.setState({
      licences: {
        ...this.state.licences,
        [type]: {
          ...this.state.licences[type],
          [licence.slug]: e.target.value
        },
        [`${type}Error`]: ""
      }
    });
  };

  render() {
    const {
      cname,
      fname,
      lname,
      email,
      phone,
      storageTB,
      storageGB,
      storageError,
      storageApplications,
      subscription: { omniView, omniFile },
      licences
    } = this.state;
    const { allLicences, loading } = this.props;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addUser">
          <p className="addUser-title">Add Customer</p>
          <p className="addUser-subtitle">
            Complete the form below to add a new customer. Fields with an * are
            mandatory.
          </p>
          <div className="global__hr-line" />
          <p className="addUser-heading">Company Details</p>
          <InputField
            className="addUser__fields-field"
            style={{ marginRight: "14px" }}
            label="Company Name*"
            value={cname.value}
            placeholder="Company Name"
            error={cname.error}
            onChange={this.onInputChange("cname")}
          />
          <p className="addUser-heading">Company Admin Details</p>
          <Row className="addUser__fields">
            <InputField
              className="addUser__fields-field"
              style={{ marginRight: "14px" }}
              label="First Name*"
              value={fname.value}
              placeholder="First Name"
              error={fname.error}
              onChange={this.onInputChange("fname")}
            />
            <InputField
              className="addUser__fields-field"
              label="Last Name*"
              value={lname.value}
              placeholder="Last Name"
              error={lname.error}
              onChange={this.onInputChange("lname")}
            />
          </Row>
          <Row className="addUser__fields">
            <InputField
              className="addUser__fields-field"
              style={{ marginRight: "14px" }}
              label="Email Address*"
              value={email.value}
              placeholder="Email"
              error={email.error}
              onChange={this.onInputChange("email")}
            />
            <PhoneField
              className="addUser__fields-field"
              error={phone.error}
              label="Phone Number*"
              value={phone.value}
              onChange={this.onPhoneChange}
            />
          </Row>
          <p className="addUser-heading">Subscription Options</p>
          <div className="addUser__section">
            <p className="addUser__section-label addUser__section-label-inactive">
              Enter the amount of data storage this customer wants:
            </p>
            <Row className="addUser__fields">
              <NumericInput
                className="addUser__fields-numeric"
                style={{ marginRight: "14px" }}
                label="# of TB*"
                value={storageTB}
                onChange={this.onStorageChange("storageTB")}
              />
              <NumericInput
                className="addUser__fields-numeric"
                style={{ marginRight: "14px" }}
                label="# of GB*"
                value={storageGB}
                onChange={this.onStorageChange("storageGB")}
              />
            </Row>
            {storageError && (
              <p className="global__field__error-text">{storageError}</p>
            )}
            <p className="addUser__section-label addUser__section-label-inactive">
              Enter the number of applications this customer wants:
            </p>
            <NumericInput
              className="addUser__fields-numeric"
              style={{ marginRight: "14px" }}
              label="# of applications*"
              value={storageApplications.value}
              error={storageApplications.error}
              onChange={this.onInputChange("storageApplications")}
            />
          </div>
          <p className="addUser-heading">Subscription Licences</p>
          <div className="addUser__section">
            <p className="addUser__section-label addUser__section-label-inactive">
              Select which applications this customer wants to license (Select
              all that apply) :
            </p>
            <div className="global__center-vert">
              <Checkbox
                value="omniView"
                className="addUser__section-checkbox"
                checked={omniView}
                onChange={this.onSubscriptionChecked}
              >
                omniVIEW
              </Checkbox>
              <Checkbox
                value="omniFile"
                className="addUser__section-checkbox"
                checked={omniFile}
                onChange={this.onSubscriptionChecked}
              >
                omniFILE
              </Checkbox>
            </div>
            {omniView && (
              <React.Fragment>
                <p
                  className="addUser__section-label addUser__section-label-inactive"
                  style={{ marginTop: "26px" }}
                >
                  Enter the # of omniVIEW subscription licenses this customer
                  wants to purchase (Select at least one):
                </p>
                <div className="addUser__section__licences">
                  {_.map(allLicences, licence => {
                    return (
                      <NumericInput
                        key={licence.name}
                        className="addUser__fields-numeric"
                        style={{ marginRight: "40px" }}
                        label={`${licence.name} Licenses`}
                        value={_.get(licences, `omniView[${licence.slug}]`, 0)}
                        onChange={this.onLicenceValueChange(
                          "omniView",
                          licence
                        )}
                      />
                    );
                  })}
                </div>
                {licences.omniViewError && (
                  <p className="global__field__error-text">
                    {licences.omniViewError}
                  </p>
                )}
              </React.Fragment>
            )}
            {omniFile && (
              <React.Fragment>
                <p
                  className="addUser__section-label addUser__section-label-inactive"
                  style={{ marginTop: "26px" }}
                >
                  Enter the # of omniFILE subscription licenses this customer
                  wants to purchase (Select at least one):
                </p>
                <div className="addUser__section__licences">
                  {_.map(allLicences, licence => {
                    return (
                      <NumericInput
                        key={licence.name}
                        className="addUser__fields-numeric"
                        style={{ marginRight: "40px" }}
                        label={`${licence.name} Licenses`}
                        value={_.get(licences, `omniFile[${licence.slug}]`, 0)}
                        onChange={this.onLicenceValueChange(
                          "omniFile",
                          licence
                        )}
                      />
                    );
                  })}
                </div>
                {licences.omniFileError && (
                  <p className="global__field__error-text">
                    {licences.omniFileError}
                  </p>
                )}
              </React.Fragment>
            )}
          </div>
          <div className="addUser__buttons">
            <OmniButton
              type="secondary"
              label="Cancel"
              className="addUser__buttons-btn"
              onClick={this.goBack}
            />
            <OmniButton
              type="primary"
              label={"Save & Submit"}
              className="addUser__buttons-btn"
              buttonStyle={{ marginLeft: "16px" }}
              onClick={this.save}
            />
          </div>
        </ContentLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    allLicences: state.Usermanagement.allLicences
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
)(AddCustomer);
