import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";
import { Checkbox, Icon, Modal } from "antd";
import { OmniButton, PermissionCheckbox, ImageLoader } from "..";
import Row from "../row/row.component";
import { getRoleNameByRoleId, isAdmin } from "../../../utils";
import { CustomerActions, ApiActions } from "../../../redux/actions";
import { CustomerApi, ApplicationApi, SubmissionApi } from "../../../redux/api";
import submissionApi from "../../../redux/api/submission.api";
import Toast from "../toast/toast";

class AccessControl extends Component {
  propTypes = {
    visible: PropTypes.bool,
    user: PropTypes.object,
    closeModal: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      order: "asc",
      customers: "",
      selectedCustomer: "",
      applications: "",
      checkAllApplications: false,
      checkAllCustomers: false,
      data: {}
    };
  }

  async componentDidMount() {
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await CustomerApi.fetchCustomersByUserId({
      userId: this.props.user.user_id
    });
    if (!res.data.error) {
      let customers = res.data.data;
      customers = _.map(customers, customer => {
        customer.checked = customer.hasAccess;
        return customer;
      });
      this.setState({ customers });
    }
    this.props.dispatch(ApiActions.successOnDemand());
  }

  sort = () => {
    let { order, customers } = this.state;
    order = order === "asc" ? "desc" : "asc";
    customers = _.orderBy(
      customers,
      customer => {
        return _.toLower(customer.company_name);
      },
      [order]
    );
    this.setState({ order, customers });
  };

  onCustomerCheck = customer => e => {
    const checked = e.target.checked;
    customer.checked = checked;
    let { data, checkAllApplications, customers } = this.state;
    let applications = data[customer.id];
    if (!applications) {
      applications = customer.checked ? [] : null;
      data[customer.id] = applications;
    } else {
      if (!applications.length) {
        applications = null;
      } else {
        applications = _.map(applications, application => {
          application.checked = customer.checked;
          application.mutated = true;
          return application;
        });
      }
      data[customer.id] = applications;
    }
    const checkAllCustomers = _.every(customers, ["checked", true]);
    if (_.get(this.state, "selectedCustomer.id", "") === customer.id) {
      checkAllApplications = _.every(applications, ["checked", true]);
    } else {
      applications = data[this.state.selectedCustomer.id];
    }
    this.setState({
      applications,
      data,
      checkAllApplications,
      checkAllCustomers
    });
  };

  onCustomerSelected = customer => async e => {
    if (e.target.type === "checkbox") {
      return;
    }
    const { data } = this.state;
    let applications = data[customer.id];
    if (!applications || !applications.length) {
      this.props.dispatch(ApiActions.requestOnDemand());
      const res = await ApplicationApi.fetchAccessedApplications({
        customerId: customer.id,
        userId: this.props.user.user_id
      });
      if (!res.data.error) {
        applications = res.data.data;
      }
      this.props.dispatch(ApiActions.successOnDemand());
    }
    applications = _.map(applications, application => {
      // ignore if already application has checked property
      if (!_.has(application, "checked")) {
        application.checked = customer.checked || application.hasAccess;
        application.mutated = false;
      }
      return application;
    });
    const allChecked = _.every(applications, ["checked", true]);
    const someAreChecked = _.some(applications, ["checked", true]);
    if (someAreChecked) {
      customer.checked = true;
    }
    this.setState({
      data: { ...this.state.data, [customer.id]: applications },
      applications,
      selectedCustomer: customer,
      checkAllApplications: allChecked
    });
  };

  onApplicationCheck = application => e => {
    const checked = e.target.checked;
    const { data, selectedCustomer, customers } = this.state;
    const applications = [...this.state.applications];
    application.checked = checked;
    application.mutated = true;
    data[selectedCustomer.id] = applications;
    const someAreChecked = _.some(applications, ["checked", true]);
    selectedCustomer.checked = someAreChecked;
    const checkAllApplications = _.every(applications, ["checked", true]);
    const checkAllCustomers = _.every(customers, ["checked", true]);
    this.setState({
      applications,
      checkAllApplications,
      checkAllCustomers,
      selectedCustomer,
      data
    });
  };

  checkAllApplications = e => {
    const checked = e.target.checked;
    const { data, selectedCustomer, customers } = this.state;
    const applications = _.map(this.state.applications, application => {
      application.checked = checked;
      application.mutated = true;
      return application;
    });
    if (selectedCustomer) {
      selectedCustomer.checked = checked;
      data[selectedCustomer.id] = applications;
    }
    const checkAllCustomers = _.every(customers, ["checked", true]);
    this.setState({
      applications,
      checkAllApplications: checked,
      checkAllCustomers,
      selectedCustomer,
      data
    });
  };

  checkAllCustomers = e => {
    const checked = e.target.checked;
    let { data, customers, selectedCustomer } = this.state;
    customers = _.map(customers, customer => {
      customer.checked = checked;
      let applications = data[customer.id];
      if (!applications) {
        applications = checked ? [] : null;
        data[customer.id] = applications;
      } else {
        if (!applications.length) {
          applications = null;
        } else {
          applications = _.map(applications, application => {
            application.checked = checked;
            application.mutated = true;
            return application;
          });
        }
        data[customer.id] = applications;
      }
      return customer;
    });
    const applications = data[selectedCustomer.id];

    this.setState({
      checkAllCustomers: checked,
      checkAllApplications: checked,
      applications,
      data
    });
  };

  save = async () => {
    console.log("state", this.state.data);
    this.props.dispatch(ApiActions.requestOnDemand());
    const { data } = this.state;
    const revoked = [];
    const granted = [];
    _.map(data, (submissions, customerId) => {
      if (!submissions) {
        revoked.push({ customerId, submissions: [], hasAllAccess: true });
      } else if (!submissions.length) {
        granted.push({ customerId, submissions: [], hasAllAccess: true });
      } else {
        const checkedSubmissions = _.filter(submissions, {
          mutated: true,
          checked: true,
          hasAccess: false
        });
        const uncheckedSubmissions = _.filter(submissions, {
          mutated: true,
          checked: false,
          hasAccess: true
        });
        if (checkedSubmissions.length) {
          granted.push({
            customerId,
            submissions: _.map(checkedSubmissions, "id"),
            hasAllAccess: false
          });
        }
        if (uncheckedSubmissions.length) {
          revoked.push({
            customerId,
            submissions: _.map(uncheckedSubmissions, "id"),
            hasAllAccess: false
          });
        }
      }
    });
    const obj = {
      userId: this.props.user.user_id,
      granted,
      revoked
    };
    console.log(obj);
    const res = await submissionApi.updateOmniciaUserPermissions(obj);
    if (!_.get(res, "data.error")) {
      this.props.closeModal();
      Toast.success(translate("text.usermgmt.permissionsupdated"));
    }
    this.props.dispatch(ApiActions.successOnDemand());
  };

  render() {
    const { visible, closeModal, user } = this.props;
    const {
      customers,
      applications,
      selectedCustomer,
      checkAllApplications,
      checkAllCustomers
    } = this.state;
    return (
      <Modal
        destroyOnClose
        visible={visible}
        closable={false}
        footer={null}
        wrapClassName="assign-permissions-modal"
      >
        <div
          className="assign-permissions-modal__header"
          style={{ marginBottom: "0px" }}
        >
          <Text
            type="extra_bold"
            size="16px"
            text={translate("label.usermgmt.accesscontrol")}
          />
          <img
            src="/images/close.svg"
            className="assign-permissions-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <Text
          type="regular"
          opacity={0.5}
          size="14px"
          text={translate("text.usermgmt.accesscontrol")}
        />
        <div className="global__center-vert" style={{ marginTop: "12px" }}>
          <ImageLoader
            path={_.get(user, "profile")}
            width="36px"
            height="36px"
            type="circle"
            style={{ marginRight: "10px" }}
          />
          {/* <Avatar size={36} icon="user" /> */}
          <div>
            <Text
              type="medium"
              size="14px"
              text={`${user.first_name} ${user.last_name}`}
            />
            <Text
              type="regular"
              size="14px"
              text={`${translate("label.usermgmt.department")}: ${
                user.department_name
              }`}
            />
          </div>
        </div>
        <div className="assign-permissions-modal__columns">
          <div
            className="assign-permissions-modal__columns-left"
            style={{ width: "50%" }}
          >
            <div className="assign-permissions-modal__subheader">
              <Text
                type="bold"
                opacity={0.5}
                size="14px"
                text={translate("label.dashboard.customers")}
              />
              <div
                className="global__center-vert global__cursor-pointer"
                onClick={this.sort}
              >
                <span>{translate("label.generic.sort")}</span>
                <Icon
                  type={
                    this.state.order === "asc"
                      ? "sort-ascending"
                      : "sort-descending"
                  }
                  style={{ fontSize: "24px", marginLeft: "5px" }}
                />
              </div>
              {(_.get(customers, "length") || "") && (
                <p>
                  Select All
                  <Checkbox
                    checked={checkAllCustomers}
                    onChange={this.checkAllCustomers}
                    style={{ marginLeft: "10px" }}
                  />
                </p>
              )}
            </div>
            <div
              className="assign-permissions-modal__columns-content"
              style={{ marginTop: "12px" }}
            >
              {_.map(customers, customer => (
                <div
                  className={`assign-permissions-modal__columns-content-item global__center-vert global__cursor-pointer ${selectedCustomer.id ===
                    customer.id && "global__node-selected"}`}
                  style={{
                    justifyContent: "space-between",
                    ...(!customer.submissionCount && {
                      cursor: "not-allowed",
                      opacity: 0.25
                    })
                  }}
                  onClick={
                    customer.submissionCount &&
                    this.onCustomerSelected(customer)
                  }
                >
                  <div>
                    <Text
                      key={customer.id}
                      type="medium"
                      size="14px"
                      text={customer.company_name}
                      textStyle={{ wordBreak: "break-word" }}
                    />
                    {!customer.submissionCount && (
                      <Text
                        type="regular"
                        size="14px"
                        text="No applications available"
                        className="global__text-red"
                        textStyle={{ wordBreak: "break-word" }}
                      />
                    )}
                  </div>
                  <PermissionCheckbox
                    disabled={customer.submissionCount === 0}
                    value={+customer.checked}
                    onChange={this.onCustomerCheck(customer)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div
            className="assign-permissions-modal__columns-right"
            style={{ width: "50%" }}
          >
            <div className="assign-permissions-modal__subheader">
              <Text
                type="bold"
                opacity={0.5}
                size="14px"
                text={translate("label.dashboard.applications")}
              />
              {(_.get(applications, "length") || "") && (
                <p>
                  Select All
                  <Checkbox
                    checked={checkAllApplications}
                    onChange={this.checkAllApplications}
                    style={{ marginLeft: "10px" }}
                  />
                </p>
              )}
            </div>
            <div className="assign-permissions-modal__columns-content">
              {_.map(applications, application => (
                <div
                  className="assign-permissions-modal__columns-content-item global__center-vert"
                  style={{ justifyContent: "space-between" }}
                >
                  <Text
                    key={application.id}
                    type="medium"
                    size="14px"
                    text={application.name}
                    textStyle={{ wordBreak: "break-word" }}
                  />
                  <PermissionCheckbox
                    value={+application.checked}
                    onChange={this.onApplicationCheck(application)}
                  />
                </div>
              ))}
              {!applications && (
                <Text
                  textStyle={{
                    marginTop: "30%",
                    padding: "0px 20px",
                    textAlign: "center"
                  }}
                  opacity={0.25}
                  type="regular"
                  size="14px"
                  text={translate("text.usermgmt.applicationaccess")}
                />
              )}
            </div>
          </div>
          <div />
        </div>
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            onClick={closeModal}
            buttonStyle={{ width: "120px", marginRight: "12px" }}
          />
          <OmniButton
            label={translate("label.button.savechanges")}
            buttonStyle={{ width: "120px" }}
            onClick={this.save}
          />
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading
  };
}

export default connect(mapStateToProps)(AccessControl);
