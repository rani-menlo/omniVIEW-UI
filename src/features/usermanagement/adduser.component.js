import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import "react-phone-number-input/style.css";
import {
  InputField,
  ContentLayout,
  Row,
  OmniButton,
  PhoneField,
  Loader,
  DeactivateModal,
  Text
} from "../../uikit/components";
import { Radio, Icon, Switch, Checkbox } from "antd";
import Header from "../header/header.component";
import { UsermanagementActions } from "../../redux/actions";
import { isEmail, isPhone, getFormattedDate } from "../../utils";
import { translate } from "../../translations/translator";
import { ROLES } from "../../constants";

const RadioGroup = Radio.Group;

const radioStyle = {
  display: "block",
  lineHeight: "30px"
};

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.roles = _.get(this.props, "selectedCustomer.is_omnicia", false)
      ? ROLES.OMNICIA
      : ROLES.CUSTOMER;
    this.state = {
      editUser: false,
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
      selectedRole: this.roles[0].id,
      selectedDept: "",
      selectedLicences: [],
      selectedLicenceError: "",
      showDeactivateModal: false,
      statusActive: true,
      licences: []
    };
  }

  static getDerivedStateFromProps(props, state) {
    let newState = null;
    if (props.departments.length && !state.selectedDept) {
      newState = {
        selectedDept: props.departments[0].id
      };
    }
    if (!state.licences.length && props.licences.length) {
      const selectedLicence = props.licences[0];
      selectedLicence.checked = true;
      newState = {
        ...newState,
        licences: props.licences,
        selectedLicences: [selectedLicence]
      };
    }
    return newState;
  }

  componentDidMount() {
    const { history, dispatch, selectedUser, selectedCustomer } = this.props;
    dispatch(UsermanagementActions.getDepartments());
    dispatch(
      UsermanagementActions.getLicences(_.get(selectedCustomer, "id", ""))
    );
    if (history.location.pathname.includes("/edit")) {
      if (selectedUser) {
        const state = this.populateState();
        this.setState({ ...state, editUser: true });
      } else {
        this.setState({ editUser: true });
      }
    }
  }

  populateState = () => {
    const { selectedUser } = this.props;
    const state = { ...this.state };
    state.fname.value = selectedUser.first_name;
    state.lname.value = selectedUser.last_name;
    state.email.value = selectedUser.email;
    state.phone.value = selectedUser.phone;
    state.selectedRole = selectedUser.role_id;
    state.selectedDept = selectedUser.department_id;
    state.statusActive = selectedUser.is_active;
    return state;
  };

  onPhoneChange = value => {
    this.setState({ phone: { ...this.state.phone, value, error: "" } });
  };

  onRoleChange = e => {
    this.setState({ selectedRole: e.target.value });
  };

  onDeptChange = e => {
    this.setState({ selectedDept: e.target.value });
  };

  onLicenceSelect = value => {
    this.setState({
      selectedLicence: { ...this.state.selectedLicence, value, error: "" }
    });
  };

  onInputChange = field => e => {
    const { value } = e.target;
    if (value === " ") {
      return;
    }
    this.setState({
      [field]: { ...this.state[field], value, error: "" }
    });
  };

  scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  save = () => {
    const state = { ...this.state };
    let error = false;
    if (!state.fname.value) {
      error = true;
      state.fname.error = translate("error.form.required", {
        type: translate("label.form.fname")
      });
    }
    if (!state.lname.value) {
      error = true;
      state.lname.error = translate("error.form.required", {
        type: translate("label.form.lname")
      });
    }
    if (state.email.value) {
      const valid = isEmail(state.email.value);
      if (!valid) {
        error = true;
        state.email.error = translate("error.form.invalid", {
          type: translate("label.form.email")
        });
      }
    } else {
      error = true;
      state.email.error = translate("error.form.required", {
        type: translate("label.form.email")
      });
    }
    if (state.phone.value) {
      const valid = isPhone(state.phone.value);
      if (!valid) {
        error = true;
        state.phone.error = translate("error.form.invalid", {
          type: translate("label.form.phone")
        });
      }
    } else {
      error = true;
      state.phone.error = translate("error.form.required", {
        type: translate("label.form.phone")
      });
    }
    // licence check only in add user
    if (
      !state.editUser &&
      this.props.licences.length &&
      !state.selectedLicences.length
    ) {
      error = true;
      state.selectedLicenceError = translate("label.user.chooselicence");
    }

    if (error) {
      this.scrollToTop();
      this.setState(state);
      return;
    }

    let reqObject = {
      firstname: state.fname.value,
      lastname: state.lname.value,
      emailaddress: state.email.value,
      phonenumber: state.phone.value,
      roleid: state.selectedRole,
      department_id: state.selectedDept,
      customer_id: this.props.selectedCustomer.id
    };

    if (state.editUser) {
      reqObject.userid = this.props.selectedUser.user_id;
      reqObject.is_active = state.statusActive ? 1 : 0;
      this.props.dispatch(
        UsermanagementActions.updateUser(reqObject, this.props.history)
      );
    } else {
      _.map(state.selectedLicences, licence => {
        if (_.includes(licence.slug, "omniview")) {
          reqObject["subscriptions"] = {
            ...reqObject["subscriptions"],
            "omni-view": licence.id
          };
        }
        if (_.includes(licence.slug, "omnifile")) {
          reqObject["subscriptions"] = {
            ...reqObject["subscriptions"],
            "omni-file": licence.id
          };
        }
      });
      this.props.dispatch(
        UsermanagementActions.addUser(reqObject, this.props.history)
      );
    }
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

  goBack = () => {
    this.props.history.goBack();
  };

  getLicenceAppName = appName => {
    return _.includes(appName, "view") ? "omniVIEW" : "omniFILE";
  };

  onLicenceChecked = licence => e => {
    const checked = e.target.checked;
    let newLicences = [...this.state.licences];
    const idx = _.findIndex(newLicences, li => li.id === licence.id);
    if (!checked) {
      newLicences[idx].checked = checked;
      const newSelectedLicences = [...this.state.selectedLicences];
      _.remove(newSelectedLicences, li => li.id === licence.id);
      this.setState({
        licences: newLicences,
        selectedLicences: newSelectedLicences
      });
    } else {
      const checkedLicecnce = _.map(
        this.state.selectedLicences,
        licence.app_name
      );
      if (!checkedLicecnce.length) {
        newLicences[idx].checked = checked;
        this.setState({
          licences: newLicences,
          selectedLicences: [...this.state.selectedLicences, newLicences[idx]],
          selectedLicenceError: ""
        });
      }
    }
  };

  render() {
    const { departments, loading, selectedUser, selectedCustomer } = this.props;
    const {
      fname,
      lname,
      email,
      phone,
      licences,
      selectedRole,
      selectedDept,
      statusActive,
      editUser,
      selectedLicences,
      selectedLicenceError
    } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addUser">
          <Text
            type="extra_bold"
            size="20px"
            className="addUser-companyname"
            text={_.get(selectedCustomer, "company_name", "")}
            onClick={this.goBack}
          />
          <div style={{ marginBottom: "15px" }}>
            <span className="maindashboard-breadcrum" onClick={this.goBack}>
              {translate("label.usermgmt.title")}
            </span>
            <span style={{ margin: "0px 5px" }}>></span>
            <span
              className="maindashboard-breadcrum"
              style={{ opacity: 0.4, cursor: "not-allowed" }}
            >
              {`${translate("label.usermgmt.add")} ${translate(
                "label.dashboard.user"
              )}`}
            </span>
          </div>
          <p className="addUser-title">
            {editUser
              ? translate("label.usermgmt.edit")
              : translate("label.usermgmt.add")}{" "}
            {translate("label.dashboard.user")}
          </p>
          <p className="addUser-subtitle">
            {editUser
              ? translate("text.user.editmsg", {
                  type: _.toLower(translate("label.dashboard.user"))
                })
              : translate("text.user.addmsg", {
                  type: _.toLower(translate("label.dashboard.user"))
                })}
          </p>
          <div className="global__hr-line" />
          <p className="addUser-heading">
            {translate("label.user.details", {
              type: translate("label.dashboard.user")
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
          <div className="addUser__section">
            <p className="addUser__section-label">
              {translate("text.user.selectrolemsg")}
            </p>
            <RadioGroup value={selectedRole} onChange={this.onRoleChange}>
              {_.map(this.roles, role => (
                <Radio
                  key={role.id}
                  style={radioStyle}
                  className="global__radio"
                  value={role.id}
                >
                  {role.name}
                </Radio>
              ))}
            </RadioGroup>
          </div>
          <div className="addUser__section">
            <p className="addUser__section-label">
              {translate("text.user.selectdeptmsg")}
            </p>
            <RadioGroup
              value={selectedDept}
              onChange={this.onDeptChange}
              className="global__radio addUser__section__radiogroup"
            >
              {_.map(departments, dept => (
                <Radio
                  key={dept.id}
                  style={radioStyle}
                  className="addUser__section__radiogroup-radio"
                  value={dept.id}
                >
                  {dept.name}
                </Radio>
              ))}
            </RadioGroup>
          </div>
          {editUser && (
            <React.Fragment>
              {/* <p className="addUser-heading">Profile Picture</p>
              <p className="addUser-subtitle" style={{ fontSize: "14px" }}>
                (Profile picture file size requirements go here)
              </p>
              <div className="addUser__profile">
                <Avatar size={80} icon="user" />
                <div className="addUser__profile__links">
                  <p className="addUser__profile__links-link">Replace Photo</p>
                  <p
                    className="addUser__profile__links-link"
                    style={{ marginTop: "15px" }}
                  >
                    Delete Photo
                  </p>
                </div>
              </div> */}
              {/* <p className="addUser-heading">Subscription Details</p> */}
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
                <p className="addUser__account-created">
                  {`${translate("text.user.createdon")} ${getFormattedDate(
                    _.get(selectedUser, "created_at", "")
                  )}`}
                </p>
              </div>
            </React.Fragment>
          )}
          {!editUser && (
            <React.Fragment>
              <p className="addUser__section addUser__section-label">
                {translate("text.user.choosesubscriptionmsg")}
              </p>
              <div className="addUser__licences">
                {(licences.length || "") && (
                  <div className="addUser__licences__box">
                    <div className="addUser__licences__box__scroll">
                      {_.map(licences, licence => (
                        <div
                          className="addUser__licences__box__scroll-item"
                          key={licence.id}
                          value={licence.id}
                        >
                          <div style={{ width: "90%" }}>
                            <div className="global__center-vert">
                              <Text
                                type="bold"
                                text={licence.name}
                                textStyle={{ marginRight: "10px" }}
                              />
                              <Text
                                type="regular"
                                size="12px"
                                opacity={0.75}
                                text={`${translate(
                                  "label.user.available"
                                )}  ${licence.remaining || 0}`}
                              />
                            </div>
                            <div className="global__center-vert">
                              <Text
                                type="bold"
                                size="12px"
                                opacity={0.75}
                                text={_.get(licence, "licenceType", "")}
                                textStyle={{ marginRight: "5px" }}
                              />
                              <Text
                                type="regular"
                                size="12px"
                                opacity={0.75}
                                text={` - Purchased on ${getFormattedDate(
                                  _.get(licence, "purchase_date")
                                )}`}
                              />
                            </div>
                            {/* <Text
                              type="regular"
                              size="14px"
                              opacity={0.75}
                              text={`Expires on ${getFormattedDate(
                                _.get(licence, "expired_date")
                              )}`}
                            /> */}
                          </div>
                          <Checkbox
                            checked={licence.checked}
                            onChange={this.onLicenceChecked(licence)}
                          />
                        </div>
                      ))}
                    </div>

                    {_.map(selectedLicences, licence => {
                      if (licence.revoked_date) {
                        return (
                          <Text
                            key={licence.id}
                            className="addUser__licences__box-warning"
                            size="12px"
                            textStyle={{ padding: "5px" }}
                            text={translate("error.user.licenceassigned", {
                              product: licence.licenceType,
                              remain: licence.validDays,
                              expire: licence.unassignValidity
                            })}
                          />
                        );
                      }
                    })}
                    {selectedLicenceError && (
                      <Text
                        className="addUser__licences__box-warning"
                        size="12px"
                        text={selectedLicenceError}
                      />
                    )}
                  </div>
                )}
                {!_.get(licences, "length") && (
                  <div className="addUser__licences__error">
                    <div className="global__center-vert">
                      <Icon
                        type="warning"
                        theme="filled"
                        className="addUser__licences__error-icon"
                      />
                      <p className="addUser__licences__error-text">
                        {translate("text.user.outoflicence")}
                      </p>
                    </div>
                    <p className="addUser__licences__error-desc">
                      {translate("text.user.addevennolicence")}
                    </p>
                  </div>
                )}
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
                editUser
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
            content={translate("text.usermgmt.deactivatemsg")}
            closeModal={this.closeModal}
            submit={this.deactivate}
          />
        </ContentLayout>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    selectedUser: state.Usermanagement.selectedUser,
    role: state.Login.role,
    departments: state.Usermanagement.departments,
    licences: state.Usermanagement.licences,
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
)(AddUser);
