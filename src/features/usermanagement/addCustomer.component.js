import React, { Component } from "react";
import styled from "styled-components";
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
  DeactivateModal,
  Text,
  TableHeader,
  Pagination,
  Toast,
  ImageLoader
} from "../../uikit/components";
import Header from "../header/header.component";
import { Checkbox, Switch, Tabs, Icon } from "antd";
import { UsermanagementActions, CustomerActions } from "../../redux/actions";
import { isPhone, isEmail, getFormattedDate } from "../../utils";
import { translate } from "../../translations/translator";
import AddNewLicence from "../license/addNewLicence.component";

const TabPane = Tabs.TabPane;

class AddCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      itemsPerPage: 5,
      editCustomer: false,
      selectedTab: "customerDetails",
      showDeactivateModal: false,
      openAddNewLicenceModal: false,
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
      },
      allLicences: null,
      disableCustomerDetailsTab: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.allLicences === null && props.allLicences.length) {
      return {
        /* allLicences: AddCustomer.getItemsBasedOnPagination(
          props.allLicences,
          state.pageNo,
          state.itemsPerPage
        ) */
        allLicences: props.allLicences
      };
    }
    return null;
  }

  static getItemsBasedOnPagination(array, pageNo, itemsPerPage) {
    return _.slice(
      array,
      (pageNo - 1) * itemsPerPage,
      pageNo * itemsPerPage - 1
    );
  }

  componentDidMount() {
    const { history, selectedCustomer } = this.props;
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
      /* if (state.subscription.omniView) {
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
      } */
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
      this.props.dispatch(
        CustomerActions.addCustomer(reqObject, () => {
          Toast.success("Customer Added");
          this.onTabChange("subscriptionLicences");
          this.setState({ disableCustomerDetailsTab: true });
        })
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
        CustomerActions.editCustomer(reqObject, () => {
          Toast.success("Customer Updated!");
          this.props.history.goBack();
        })
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
    this.setState({
      showDeactivateModal: false,
      openAddNewLicenceModal: false
    });
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

  onTabChange = tab => {
    const { selectedCustomer } = this.props;
    if (selectedCustomer && tab === "subscriptionLicences") {
      this.props.dispatch(
        UsermanagementActions.getAllLicences(selectedCustomer.id)
      );
    }
    this.setState({ selectedTab: tab });
  };

  openAddNewLicence = () => {
    this.setState({ openAddNewLicenceModal: true });
  };

  addNewLicence = licences => {
    const { selectedCustomer } = this.props;
    const newLicences = _.map(licences, licence => ({
      subscription_type_id: licence.application.id,
      subscription_licence_id: licence.duration.id,
      number_of_licences: licence.quantity
    }));
    this.props.dispatch(
      CustomerActions.addNewLicences(
        {
          customer_id: selectedCustomer.id,
          subscriptions: newLicences
        },
        () => {
          Toast.success("Subscription Licenses Added!");
          this.onTabChange("subscriptionLicences");
        }
      )
    );
    this.closeModal();
  };

  onPageChange = pageNo => {
    this.setState({
      pageNo,
      allLicences: AddCustomer.getItemsBasedOnPagination(
        this.props.allLicences,
        pageNo,
        this.state.itemsPerPage
      )
    });
  };

  onPageSizeChange = itemsPerPage => {
    this.setState({
      itemsPerPage,
      allLicences: AddCustomer.getItemsBasedOnPagination(
        this.props.allLicences,
        this.state.pageNo,
        itemsPerPage
      )
    });
  };

  sortColumn = (sortBy, orderBy) => {
    const { allLicences } = this.state;
    const sortedLicences = _.orderBy(allLicences, [sortBy], [orderBy]);
    this.setState({ allLicences: sortedLicences });
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
      statusActive,
      selectedTab
    } = this.state;
    const { loading, licencesUnAssigned } = this.props;
    const { allLicences } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addUser">
          <Text
            type="extra_bold"
            size="20px"
            className="addUser-companyname"
            text={_.get(this.props.selectedCustomer, "company_name", "")}
            onClick={this.goBack}
          />
          <Tabs
            activeKey={selectedTab}
            className="addUser__tabs"
            onChange={this.onTabChange}
          >
            <TabPane
              tab="Customer Details"
              key="customerDetails"
              disabled={this.state.disableCustomerDetailsTab}
            >
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
                allowSpaces
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
              {/* {!editCustomer && (
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
              )} */}
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
                      : translate("label.button.savecontinue")
                  }
                  className="addUser__buttons-btn"
                  buttonStyle={{ marginLeft: "16px" }}
                  onClick={this.save}
                />
              </div>
            </TabPane>
            <TabPane
              tab="Subscription Licences"
              key="subscriptionLicences"
              disabled={!this.props.selectedCustomer}
            >
              <Row style={{ justifyContent: "space-between" }}>
                <Text
                  type="regular"
                  size="16px"
                  opacity={0.5}
                  text={translate("text.licence.viewallexisting")}
                />
                <OmniButton
                  type="add"
                  label={translate("label.button.add", {
                    type: translate("label.licence.licences")
                  })}
                  onClick={this.openAddNewLicence}
                />
              </Row>
              <TableHeader
                columns={TableColumns}
                style={{ marginTop: "10px" }}
                sortColumn={this.sortColumn}
              />
              {_.map(allLicences, licence => (
                <Row
                  key={licence.id}
                  className="maindashboard__list__item"
                  style={{ cursor: "auto" }}
                >
                  <Column
                    width={getColumnWidth(TableColumnNames.APPLICATION)}
                    className="maindashboard__list__item-text-bold"
                  >
                    {_.get(licence, "type_name", "")}
                  </Column>
                  <Column
                    width={getColumnWidth(TableColumnNames.DURATION)}
                    className="maindashboard__list__item-text"
                  >
                    {_.get(licence, "duration_name", "")}
                  </Column>
                  <Column
                    width={getColumnWidth(TableColumnNames.EXPIRATION_DATE)}
                    className="maindashboard__list__item-text"
                  >
                    {getFormattedDate(_.get(licence, "expired_date", ""))}
                  </Column>
                  <Column
                    width={getColumnWidth(TableColumnNames.STATUS)}
                    className="maindashboard__list__item-text"
                  >
                    {_.get(licence, "first_name", "")
                      ? "Assigned"
                      : "Unassigned"}
                  </Column>
                  <Column
                    width={getColumnWidth(TableColumnNames.USER)}
                    className="maindashboard__list__item-text"
                  >
                    {_.get(licence, "first_name", "") && (
                      <ImageLoader
                        style={{ marginRight: "5px" }}
                        type="circle"
                        width="20px"
                        height="20px"
                        path={licence.profile}
                      />
                    )}
                    {`${_.get(licence, "first_name", "")}  ${_.get(
                      licence,
                      "last_name",
                      ""
                    )}`}
                  </Column>
                  <Column
                    width={getColumnWidth(TableColumnNames.ACTIONS)}
                    className="maindashboard__list__item-text maindashboard__list__item-text-link"
                    style={{ cursor: "not-allowed" }}
                  >
                    {_.get(licence, "first_name", "") ? "Remove" : "Assign"}
                  </Column>
                </Row>
              ))}
              {/* <Pagination
                containerStyle={
                  _.get(allLicences, "length", 0) > 4
                    ? { marginTop: "1%" }
                    : { marginTop: "20%" }
                }
                total={_.get(this.props.allLicences, "length", 0)}
                showTotal={(total, range) =>
                  translate("text.pagination", {
                    top: range[0],
                    bottom: range[1],
                    total,
                    type: translate("label.dashboard.customers")
                  })
                }
                pageSize={this.state.itemsPerPage}
                current={this.state.pageNo}
                onPageChange={this.onPageChange}
                onPageSizeChange={this.onPageSizeChange}
              /> */}
              {!_.get(allLicences, "length", 0) && (
                <Row className="maindashboard__nodata">
                  <Icon
                    style={{ fontSize: "20px" }}
                    type="exclamation-circle"
                    className="maindashboard__nodata-icon"
                  />
                  {translate("error.dashboard.notfound", {
                    type: translate("text.customer.subslicences")
                  })}
                </Row>
              )}
            </TabPane>
          </Tabs>

          <DeactivateModal
            isActive={this.state.statusActive}
            visible={this.state.showDeactivateModal}
            title={`${translate("label.usermgmt.deactivateacc")}?`}
            content={translate("text.customer.deactivate")}
            closeModal={this.closeModal}
            deactivate={this.deactivate}
          />
          {this.state.openAddNewLicenceModal && (
            <AddNewLicence
              visible={this.state.openAddNewLicenceModal}
              closeModal={this.closeModal}
              addNewLicence={this.addNewLicence}
            />
          )}
        </ContentLayout>
      </React.Fragment>
    );
  }
}

const getColumnWidth = _.memoize(name => {
  const col = _.find(TableColumns, col => col.name === name);
  return _.get(col, "width");
});

const Column = styled.div`
  width: ${props => props.width};
`;

const TableColumnNames = {
  APPLICATION: translate("label.dashboard.application"),
  DURATION: translate("label.licence.duration"),
  EXPIRATION_DATE: translate("label.licence.expirationdate"),
  STATUS: translate("label.user.status"),
  USER: translate("label.dashboard.user"),
  ACTIONS: translate("label.generic.actions")
};

const TableColumns = [
  {
    name: TableColumnNames.APPLICATION,
    key: "type_name",
    // sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.DURATION,
    key: "duration",
    // sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.EXPIRATION_DATE,
    key: "expired_date",
    // sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.STATUS,
    key: "status",
    // sort: true,
    width: "15%"
  },
  {
    name: TableColumnNames.USER,
    key: "first_name",
    // sort: true,
    width: "20%"
  },
  {
    name: TableColumnNames.ACTIONS,
    width: "10%"
  }
];

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
