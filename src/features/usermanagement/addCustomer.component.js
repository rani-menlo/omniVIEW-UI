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
  NumericInput,
  DeactivateModal
} from "../../uikit/components";
import Header from "../header/header.component";
import { Checkbox, Switch } from "antd";
import { UsermanagementActions } from "../../redux/actions";
import { isPhone, isEmail } from "../../utils";
import { translate } from "../../translations/translator";

class AddCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editCustomer: false,
      showDeactivateModal: false,
      statusActive: true,
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
    const { history, selectedCustomer } = this.props;
    this.props.dispatch(UsermanagementActions.getAllLicences());
    if (history.location.pathname.includes("/edit")) {
      if (selectedCustomer) {
        const state = this.populateState();
        this.setState({ ...state, editCustomer: true });
      } else {
        this.setState({ editCustomer: true });
      }
    }
  }

  populateState = () => {
    const { selectedCustomer } = this.props;
    const state = { ...this.state };
    state.cname.value = selectedCustomer.company_name;
    state.fname.value = selectedCustomer.first_name;
    state.lname.value = selectedCustomer.last_name;
    state.email.value = selectedCustomer.email;
    state.phone.value = selectedCustomer.phone;
    state.storageTB = selectedCustomer.tbSpace || 0;
    state.storageGB = selectedCustomer.gbSpace || 0;
    state.storageApplications.value = selectedCustomer.max_apps;
    state.statusActive = selectedCustomer.is_active;
    /* state.subscription.omniView = _.includes(
      selectedCustomer.application_access,
      "omniView",
      false
    );
    state.subscription.omniFile = _.includes(
      selectedCustomer.application_access,
      "omniFile",
      false
    );
    state.licences.omniView = _.get(
      selectedCustomer,
      'subscriptions["omni-view"]',
      {}
    );
    state.licences.omniFile = _.get(
      selectedCustomer,
      'subscriptions["omni-file"]',
      {}
    ); */
    return state;
  };

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
      state.cname.error = translate("error.form.required", {
        type: translate("label.form.companyname")
      });
      window.scrollTo(0, 0);
    }
    if (!state.fname.value) {
      error = true;
      state.fname.error = translate("error.form.required", {
        type: translate("label.form.fname")
      });
      window.scrollTo(0, 0);
    }
    if (!state.lname.value) {
      error = true;
      state.lname.error = translate("error.form.required", {
        type: translate("label.form.lname")
      });
      window.scrollTo(0, 0);
    }
    if (state.email.value) {
      const valid = isEmail(state.email.value);
      if (!valid) {
        error = true;
        state.email.error = translate("error.form.invalid", {
          type: translate("label.form.email")
        });
        window.scrollTo(0, 0);
      }
    } else {
      error = true;
      state.email.error = translate("error.form.required", {
        type: translate("label.form.email")
      });
      window.scrollTo(0, 0);
    }
    if (state.phone.value) {
      const valid = isPhone(state.phone.value);
      if (!valid) {
        error = true;
        state.phone.error = translate("error.form.invalid", {
          type: translate("label.form.phone")
        });
        window.scrollTo(0, 0);
      }
    } else {
      error = true;
      state.phone.error = translate("error.form.required", {
        type: translate("label.form.phone")
      });
    }
    const storage = Number(state.storageTB) + Number(state.storageGB);
    if (storage === 0) {
      error = true;
      state.storageError = translate("error.form.required", {
        type: translate("label.form.storage")
      });
    }

    if (!state.editCustomer) {
      if (!state.storageApplications.value) {
        error = true;
        state.storageApplications.error = translate("error.form.required", {
          type: translate("label.form.noofapplications")
        });
      }
      if (state.subscription.omniView) {
        const values = _.values(state.licences.omniView);
        if (this.hasAllZeros(values)) {
          error = true;
          state.licences.omniViewError = translate("error.licence.atleastone");
        }
      }
      if (state.subscription.omniFile) {
        const values = _.values(state.licences.omniFile);
        if (this.hasAllZeros(values)) {
          error = true;
          state.licences.omniFileError = translate("error.licence.atleastone");
        }
      }
    }

    if (error) {
      this.setState(state);
      return;
    }

    let reqObject = {
      customerName: state.cname.value,
      first_name: state.fname.value,
      last_name: state.lname.value,
      email: state.email.value,
      phone: state.phone.value,
      tbSpace: state.storageTB || 0,
      gbSpace: state.storageGB || 0,
      max_apps: state.storageApplications.value
    };

    if (!state.editCustomer) {
      const application_access = [];
      state.subscription.omniView && application_access.push("omniView");
      state.subscription.omniFile && application_access.push("omniFile");

      reqObject = {
        ...reqObject,
        application_access,
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
    } else {
      reqObject.customerId = _.get(this.props, "selectedCustomer.id", "");
      reqObject.cAdminId = _.get(
        this.props,
        "selectedCustomer.primary_user_id",
        ""
      );
      reqObject.is_active = state.statusActive ? 1 : 0;
      this.props.dispatch(
        UsermanagementActions.editCustomer(reqObject, this.props.history)
      );
    }
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

  closeModal = () => {
    this.setState({ showDeactivateModal: false });
  };

  onStatusClick = () => {
    if (this.state.statusActive) {
      this.setState({ showDeactivateModal: true });
    } else {
      this.setState({ statusActive: true });
    }
  };

  deactivate = () => {
    this.setState({ showDeactivateModal: false, statusActive: false });
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
      licences,
      editCustomer,
      statusActive
    } = this.state;
    const { allLicences, loading } = this.props;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addUser">
          <p className="addUser-title">
            {editCustomer
              ? translate("label.usermgmt.edit")
              : translate("label.usermgmt.add")}{" "}
            {translate("label.dashboard.customer")}
          </p>
          <p className="addUser-subtitle">
            {editCustomer
              ? translate("text.user.editmsg", {
                  type: _.toLower(translate("label.dashboard.customer"))
                })
              : translate("text.user.addmsg", {
                  type: _.toLower(translate("label.dashboard.customer"))
                })}
          </p>
          <div className="global__hr-line" />
          <p className="addUser-heading">
            {translate("label.user.details", {
              type: translate("label.dashboard.company")
            })}
          </p>
          <InputField
            className="addUser__fields-field"
            style={{ marginRight: "14px" }}
            label={`${translate("label.form.companyname")}*`}
            value={cname.value}
            placeholder={translate("label.form.companyname")}
            error={cname.error}
            onChange={this.onInputChange("cname")}
          />
          <p className="addUser-heading">
            {translate("label.user.details", {
              type: translate("label.dashboard.companyadmin")
            })}
          </p>
          <Row className="addUser__fields">
            <InputField
              className="addUser__fields-field"
              style={{ marginRight: "14px" }}
              label={`${translate("label.form.fname")}*`}
              value={fname.value}
              placeholder={translate("label.form.fname")}
              error={fname.error}
              onChange={this.onInputChange("fname")}
            />
            <InputField
              className="addUser__fields-field"
              label={`${translate("label.form.lname")}*`}
              value={lname.value}
              placeholder={translate("label.form.lname")}
              error={lname.error}
              onChange={this.onInputChange("lname")}
            />
          </Row>
          <Row className="addUser__fields">
            <InputField
              className="addUser__fields-field"
              style={{ marginRight: "14px" }}
              label={`${translate("label.form.email")}*`}
              value={email.value}
              placeholder={translate("placeholder.form.email")}
              error={email.error}
              onChange={this.onInputChange("email")}
            />
            <PhoneField
              className="addUser__fields-field"
              error={phone.error}
              label={`${translate("label.form.phone")}*`}
              value={phone.value}
              onChange={this.onPhoneChange}
            />
          </Row>
          <p className="addUser-heading">
            {translate("text.customer.subsoptions")}
          </p>
          <div className="addUser__section">
            <p className="addUser__section-label addUser__section-label-inactive">
              {translate("text.customer.amtofdatastorage")}
            </p>
            <Row className="addUser__fields">
              <NumericInput
                className="addUser__fields-numeric"
                style={{ marginRight: "14px" }}
                label={`${translate("label.form.storageof", {
                  type: translate("label.storage.tb")
                })}*`}
                value={storageTB}
                onChange={this.onStorageChange("storageTB")}
              />
              <NumericInput
                className="addUser__fields-numeric"
                style={{ marginRight: "14px" }}
                label={`${translate("label.form.storageof", {
                  type: translate("label.storage.gb")
                })}*`}
                value={storageGB}
                onChange={this.onStorageChange("storageGB")}
              />
            </Row>
            {storageError && (
              <p className="global__field__error-text">{storageError}</p>
            )}
            <p className="addUser__section-label addUser__section-label-inactive">
              {translate("text.customer.noofapplications")}
            </p>
            <NumericInput
              className="addUser__fields-numeric"
              style={{ marginRight: "14px" }}
              label={`${translate("label.form.noofapplications")}*`}
              value={storageApplications.value}
              error={storageApplications.error}
              onChange={this.onInputChange("storageApplications")}
            />
          </div>
          {!editCustomer && (
            <React.Fragment>
              <p className="addUser-heading">
                {translate("text.customer.subslicences")}
              </p>
              <div className="addUser__section">
                <p className="addUser__section-label addUser__section-label-inactive">
                  {translate("text.customer.applicationstolicence")}
                </p>
                <div className="global__center-vert">
                  <Checkbox
                    value="omniView"
                    className="addUser__section-checkbox"
                    checked={omniView}
                    onChange={this.onSubscriptionChecked}
                  >
                    {translate("label.product.omniview")}
                  </Checkbox>
                  <Checkbox
                    disabled
                    value="omniFile"
                    className="addUser__section-checkbox"
                    checked={omniFile}
                    onChange={this.onSubscriptionChecked}
                  >
                    {translate("label.product.omnifile")}
                  </Checkbox>
                </div>
                {omniView && (
                  <React.Fragment>
                    <p
                      className="addUser__section-label addUser__section-label-inactive"
                      style={{ marginTop: "26px" }}
                    >
                      {translate("text.customer.nooflicencetopurchase", {
                        type: translate("label.product.omniview")
                      })}
                    </p>
                    <div className="addUser__section__licences">
                      {_.map(allLicences, licence => {
                        return (
                          <NumericInput
                            key={licence.name}
                            className="addUser__fields-numeric"
                            style={{ marginRight: "40px" }}
                            label={`${licence.name}`}
                            value={_.get(
                              licences,
                              `omniView[${licence.slug}]`,
                              0
                            )}
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
                      {translate("text.customer.nooflicencetopurchase", {
                        type: translate("label.product.omnifile")
                      })}
                    </p>
                    <div className="addUser__section__licences">
                      {_.map(allLicences, licence => {
                        return (
                          <NumericInput
                            key={licence.name}
                            className="addUser__fields-numeric"
                            style={{ marginRight: "40px" }}
                            label={`${licence.name}`}
                            value={_.get(
                              licences,
                              `omniFile[${licence.slug}]`,
                              0
                            )}
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
            </React.Fragment>
          )}
          {editCustomer && (
            <React.Fragment>
              <p className="addUser-heading">
                {translate("label.user.accstatus")}
              </p>
              <div className="addUser__account">
                <div className="addUser__account__status">
                  <Switch
                    size="small"
                    onClick={this.onStatusClick}
                    checked={statusActive}
                  />
                  <p
                    className={`addUser__account__status-${
                      statusActive ? "active" : "inactive"
                    }`}
                  >
                    {statusActive
                      ? translate("label.user.active")
                      : translate("label.user.inactive")}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}
          <div className="addUser__buttons">
            <OmniButton
              type="secondary"
              label={translate("label.button.cancel")}
              className="addUser__buttons-btn"
              onClick={this.goBack}
            />
            <OmniButton
              type="primary"
              label={
                editCustomer
                  ? translate("label.button.savechanges")
                  : translate("label.button.savesubmit")
              }
              className="addUser__buttons-btn"
              buttonStyle={{ marginLeft: "16px" }}
              onClick={this.save}
            />
          </div>
          <DeactivateModal
            isActive={this.state.statusActive}
            visible={this.state.showDeactivateModal}
            title={`${translate("label.usermgmt.deactivateacc")}?`}
            content={translate("text.customer.deactivate")}
            closeModal={this.closeModal}
            deactivate={this.deactivate}
          />
        </ContentLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    allLicences: state.Usermanagement.allLicences,
    selectedCustomer: state.Customer.selectedCustomer
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
