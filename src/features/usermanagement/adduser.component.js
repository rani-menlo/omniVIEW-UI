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
  DeactivateModal
} from "../../uikit/components";
import { Radio, Select, Icon, Avatar, Switch, Modal } from "antd";
import Header from "../header/header.component";
import { UsermanagementActions } from "../../redux/actions";
import { isEmail, isPhone, isLoggedInOmniciaRole } from "../../utils";
import { ROLES } from "../../constants";

const RadioGroup = Radio.Group;
const Option = Select.Option;

const radioStyle = {
  display: "block",
  lineHeight: "30px"
};

class AddUser extends Component {
  roles = isLoggedInOmniciaRole(this.props.role)
    ? ROLES.OMNICIA
    : ROLES.CUSTOMER;

  constructor(props) {
    super(props);
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
      selectedLicence: {
        value: "",
        error: ""
      },
      showDeactivateModal: false,
      statusActive: true
    };
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

  static getDerivedStateFromProps(props, state) {
    if (props.departments.length && !state.selectedDept) {
      return {
        selectedDept: props.departments[0].id
      };
    }
    return null;
  }

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

  save = () => {
    const state = { ...this.state };
    let error = false;
    if (!state.fname.value) {
      error = true;
      state.fname.error = "First Name is required";
    }
    if (!state.lname.value) {
      error = true;
      state.lname.error = "Last Name is required";
    }
    if (state.email.value) {
      const valid = isEmail(state.email.value);
      if (!valid) {
        error = true;
        state.email.error = "Enter valid email";
      }
    } else {
      error = true;
      state.email.error = "Email is required";
    }
    if (state.phone.value) {
      const valid = isPhone(state.phone.value);
      if (!valid) {
        error = true;
        state.phone.error = "Enter valid Phone";
      }
    } else {
      error = true;
      state.phone.error = "Phone is required";
    }
    // licence check only in add user
    if (
      !state.editUser &&
      this.props.licences.length &&
      !state.selectedLicence.value
    ) {
      error = true;
      state.selectedLicence.error = "Choose licence";
    }

    if (error) {
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
      subscription_id: state.selectedLicence.value,
      customer_id: this.props.selectedCustomer.id
    };

    if (state.editUser) {
      reqObject.userid = this.props.selectedUser.user_id;
      reqObject = _.omit(reqObject, ["subscription_id"]);
      reqObject.is_active = state.statusActive ? 1 : 0;
      this.props.dispatch(
        UsermanagementActions.updateUser(reqObject, this.props.history)
      );
    } else {
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

  render() {
    const { departments, licences, loading } = this.props;
    const {
      fname,
      lname,
      email,
      phone,
      selectedLicence,
      selectedRole,
      selectedDept,
      statusActive,
      editUser
    } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addUser">
          <div style={{ marginBottom: "15px" }}>
            <span className="maindashboard-breadcrum" onClick={this.goBack}>
              User Management
            </span>
            <span style={{ margin: "0px 5px" }}>></span>
            <span
              className="maindashboard-breadcrum"
              style={{ opacity: 0.4, cursor: "not-allowed" }}
            >
              Add User
            </span>
          </div>
          <p className="addUser-title">{editUser ? "Edit" : "Add"} User</p>
          <p className="addUser-subtitle">
            {editUser
              ? "Make edits to this user profile below"
              : "Complete the form below to add a new user. Fields with an * are mandatory."}
          </p>
          <div className="global__hr-line" />
          <p className="addUser-heading">User Details</p>
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
          <div className="addUser__section">
            <p className="addUser__section-label">
              Select the role that this user will be assigned*
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
              Select the department this user is a part of*
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
              <p className="addUser-heading">Account Status</p>
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
                    {statusActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <p className="addUser__account-created">
                  Account created on 12/12/2017
                </p>
              </div>
            </React.Fragment>
          )}
          {!editUser && (
            <React.Fragment>
              <p className="addUser__section addUser__section-label">
                Choose a subscription license to apply to this user's account.
              </p>
              <div className="addUser__licences">
                {(_.get(licences, "length") || "") && (
                  <div>
                    <p className="global__field-label">Available Licenses</p>
                    <Select
                      value={
                        _.get(selectedLicence, "value") || "Choose Licence"
                      }
                      className={`addUser__dropdown ${selectedLicence.error &&
                        "addUser__dropdown-error"}`}
                      suffixIcon={
                        <Icon
                          type="down"
                          style={{ fontSize: "15px", color: "black" }}
                        />
                      }
                      onChange={this.onLicenceSelect}
                    >
                      {_.map(licences, licence => (
                        <Option key={licence.id} value={licence.id}>
                          {licence.name}
                        </Option>
                      ))}
                    </Select>
                    {selectedLicence.error && (
                      <p
                        className="global__field__error-text"
                        style={{ marginTop: "0px" }}
                      >
                        {selectedLicence.error}
                      </p>
                    )}
                  </div>
                )}
                {/* {
                  <div className="addUser__licences__box">
                    {_.map(licences, licence => (
                      <div
                        className="addUser__licences__box-item global__center-vert"
                        key={licence.id}
                        value={licence.id}
                      >
                        <div>
                          <p>6 - month license</p>
                          <p>omniVIEW - Purchased on 1/3/2019</p>
                        </div>
                      </div>
                    ))}
                  </div>
                } */}
                {!_.get(licences, "length") && (
                  <div className="addUser__licences__error">
                    <div className="global__center-vert">
                      <Icon
                        type="warning"
                        theme="filled"
                        className="addUser__licences__error-icon"
                      />
                      <p className="addUser__licences__error-text">
                        You’re out of licenses!
                      </p>
                    </div>
                    <p className="addUser__licences__error-desc">
                      You can still add this user, but they won’t be able to
                      login and access the platform until they’re assigned a
                      subscription license. Contact an Omnicia Admin to purchase
                      more licenses for your account.
                    </p>
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
          <div className="addUser__buttons">
            <OmniButton
              type="secondary"
              label="Cancel"
              className="addUser__buttons-btn"
              onClick={this.goBack}
            />
            <OmniButton
              type="primary"
              label={editUser ? "Save Changes" : "Save & Submit"}
              className="addUser__buttons-btn"
              buttonStyle={{ marginLeft: "16px" }}
              onClick={this.save}
            />
          </div>
          <DeactivateModal
            visible={this.state.showDeactivateModal}
            title="Deactivate Account?"
            content="This user will no longer be able to access the system until an
            Omnicia administrator enables their account again. Any remaining
            time from the assigned subscription license can be applied to
            another user within 30 days."
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
