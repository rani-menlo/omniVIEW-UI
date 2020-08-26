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
  DeactivateModal,
  Text,
  Toast,
  ImageLoader,
} from "../../uikit/components";
import Header from "../header/header.component";
import {
  Switch,
  Tabs,
  Icon,
  Popover,
  Dropdown,
  Menu,
  Table,
  Modal,
} from "antd";
import {
  UsermanagementActions,
  CustomerActions,
  ApiActions,
} from "../../redux/actions";
import {
  isPhone,
  isEmail,
  getFormattedDate,
  isLoggedInOmniciaAdmin,
} from "../../utils";
import { translate } from "../../translations/translator";
import AddNewLicence from "../license/addNewLicence.component";
import PopoverCustomers from "./popoverCustomers.component";
import AssignLicence from "../license/assignLicence.component";
import AssignLicenceWithUsers from "../license/assignLicenceWithUsers.component";
import Subscriptions from "../license/subscriptions.component";
import { ROLE_IDS, URI } from "../../constants";
import API from "../../redux/api";

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
      selectedPrimaryContact: null,
      disablePrimaryContactFields: true,
      isEmpty: true,
      cname: {
        value: "",
        error: "",
      },
      afsPath: {
        value: "",
        error: "",
      },
      fname: {
        value: "",
        error: "",
      },
      lname: {
        value: "",
        error: "",
      },
      email: {
        value: "",
        error: "",
      },
      phone: {
        value: "",
        error: "",
      },
      storageTB: 0,
      storageGB: 0,
      storageError: "",
      storageApplications: {
        value: 0,
        error: "",
      },
      subscription: {
        omniView: true,
        omniFile: false,
      },
      licences: {
        omniView: {},
        omniFile: {},
        omniViewError: "",
        omniFileError: "",
      },
      disableCustomerDetailsTab: false,
      allLicences: null,
      showLicenceUnAssigned: false,
      showUsersModal: false,
      showAssignLicenceToUser: false,
      assigningLicence: null,
      selectedUser: null,
    };
    this.Columns = [
      {
        title: translate("label.dashboard.user"),
        dataIndex: "name",
        key: "name",
        render: (text, user) => (
          <div className="global__center-vert">
            <ImageLoader
              type="circle"
              path={_.get(user, "profile", null)}
              width="35px"
              height="35px"
              style={{ marginRight: "10px" }}
            />
            <Text
              type="regular"
              size="14px"
              text={`${_.get(user, "first_name", "")} ${_.get(
                user,
                "last_name",
                ""
              )}`}
            />
          </div>
        ),
        width: 200,
      },
      {
        title: translate("label.user.status"),
        dataIndex: "status",
        key: "status",
        render: (text, user) => (
          <Text
            type="regular"
            size="14px"
            opacity={0.75}
            className={`global__text-${
              _.get(user, "license_status", 0) ? "green" : "red"
            }`}
            text={
              _.get(user, "license_status", 0)
                ? translate("label.user.active")
                : translate("label.user.inactive")
            }
          />
        ),
        width: 100,
      },
      {
        title: translate("label.generic.actions"),
        dataIndex: "",
        key: "actions",
        render: (text, user) => (
          <Text
            type="medium"
            size="12px"
            text="Remove"
            className="global__cursor-pointer global__color-blue"
            onClick={this.removeSecContact(user)}
          />
        ),
        width: 100,
      },
    ];
  }

  static getDerivedStateFromProps(props, state) {
    let newState = {};
    if (state.allLicences === null && props.allLicences.length) {
      newState = {
        allLicences: AddCustomer.getItemsBasedOnPagination(
          props.allLicences,
          state.pageNo,
          state.itemsPerPage
        ),
      };
    }
    if (
      props.selectedCustomer &&
      !state.selectedPrimaryContact &&
      state.disablePrimaryContactFields &&
      props.cAdmins.length
    ) {
      newState = {
        ...newState,
        ...AddCustomer.getPrimaryContactDetailsState(
          props,
          state,
          props.selectedCustomer.primary_user_id
        ),
      };
    }
    return _.size(newState) ? newState : null;
  }

  static getItemsBasedOnPagination(array, pageNo, itemsPerPage) {
    const from = (pageNo - 1) * itemsPerPage;
    const to = pageNo * itemsPerPage;
    const newArray = _.slice(array, from, to);

    return newArray;
  }

  static getPrimaryContactDetailsState(props, state, userId) {
    const admin = _.find(props.cAdmins, (admin) => Number(admin.user_id) === Number(userId));
    const { fname, lname, email, phone } = state;
    return {
      disablePrimaryContactFields: true,
      selectedPrimaryContact: admin,
      fname: { ...fname, value: _.get(admin, "first_name", "") },
      lname: { ...lname, value: _.get(admin, "last_name", "") },
      email: { ...email, value: _.get(admin, "email", "") },
      phone: { ...phone, value: _.get(admin, "phone", "") },
    };
  }

  /**
   * Selected customer to edit
   * @param {*} customer
   */
  checkEmptyAfsPath = async (customer) => {
    // Checking for Customer folder Name is  empty or not
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await API.get(
      URI.IS_CUSTOMER_FOLDER_EMPTY.replace(":customerId", customer.id)
    );
    this.props.dispatch(ApiActions.successOnDemand());
    if (!res.data.error) {
      this.setState({ isEmpty: res.data.isEmpty });
    } else {
      this.setState({ isEmpty: false });
    }
  };

  componentDidMount() {
    const { history, selectedCustomer } = this.props;
    if (history.location.pathname.includes("/edit")) {
      let newState = { editCustomer: true };
      this.checkEmptyAfsPath(selectedCustomer);
      if (selectedCustomer) {
        const state = this.populateState();
        newState = { ...state, ...newState };
        if (selectedCustomer.is_omnicia === true) {
          this.fetchOmniAdmins();
          this.fetchOmniUsers();
        } else {
          this.fetchCustomerAdmins();
          this.fetchUsers();
        }
      }
      if (history.location.pathname.endsWith("subscriptions")) {
        newState.selectedTab = "subscriptionLicences";
      }
      this.setState(newState);
    }
    window.scrollTo(0, 0);
  }

  fetchCustomerAdmins = (customer = this.props.selectedCustomer, cb) => {
    this.props.dispatch(
      UsermanagementActions.fetchAdmins(
        {
          customerId: customer.id,
          roles: [ROLE_IDS.CUSTOMER.administrator],
        },
        cb
      )
    );
  };

  fetchOmniAdmins = (customer = this.props.selectedCustomer, cb) => {
    this.props.dispatch(
      UsermanagementActions.fetchAdmins(
        {
          customerId: customer.id,
          roles: [ROLE_IDS.OMNICIA.administrator],
        },
        cb
      )
    );
  };

  fetchUsers = (customer = this.props.selectedCustomer) => {
    this.props.dispatch(
      UsermanagementActions.fetchUsers({
        customerId: customer.id,
        includeLoggedInUser: true,
        roles: _.values(ROLE_IDS.CUSTOMER),
      })
    );
  };

  fetchOmniUsers = (customer = this.props.selectedCustomer) => {
    this.props.dispatch(
      UsermanagementActions.fetchUsers({
        customerId: customer.id,
        includeLoggedInUser: true,
        roles: _.values(ROLE_IDS.OMNICIA),
      })
    );
  };

  populateState = (selectedCustomer = this.props.selectedCustomer) => {
    const state = { ...this.state };
    state.cname.value = selectedCustomer.company_name;
    state.afsPath.value = selectedCustomer.afsPath;
    state.fname.value = selectedCustomer.first_name;
    state.lname.value = selectedCustomer.last_name;
    state.email.value = selectedCustomer.email;
    state.phone.value = selectedCustomer.phone;
    state.storageTB = selectedCustomer.tbSpace || 0;
    state.storageGB = selectedCustomer.gbSpace || 0;
    state.storageApplications.value = selectedCustomer.max_apps;
    state.statusActive = selectedCustomer.is_active;
    return state;
  };

  onInputChange = (field) => (e) => {
    const { value } = e.target;
    this.setState({
      [field]: { ...this.state[field], value, error: "" },
    });
  };

  onStorageChange = (field) => (e) => {
    const { value } = e.target;
    console.log(value, field);
    this.setState({
      [field]: value,
      storageError: "",
    });
  };

  onPhoneChange = (value) => {
    this.setState({ phone: { ...this.state.phone, value, error: "" } });
  };

  onSubscriptionChecked = (e) => {
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
      subscription: { ...this.state.subscription, [value]: checked },
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
        type: translate("label.form.companyname"),
      });
      window.scrollTo(0, 0);
    }
    if (!state.afsPath.value) {
      error = true;
      state.afsPath.error = translate("error.form.required", {
        type: translate("label.form.afsPath"),
      });
      window.scrollTo(0, 0);
    }
    if (!state.fname.value) {
      error = true;
      state.fname.error = translate("error.form.required", {
        type: translate("label.form.fname"),
      });
      window.scrollTo(0, 0);
    }
    if (!state.lname.value) {
      error = true;
      state.lname.error = translate("error.form.required", {
        type: translate("label.form.lname"),
      });
      window.scrollTo(0, 0);
    }
    if (state.email.value) {
      const valid = isEmail(state.email.value);
      if (!valid) {
        error = true;
        state.email.error = translate("error.form.invalid", {
          type: translate("label.form.email"),
        });
        window.scrollTo(0, 0);
      }
    } else {
      error = true;
      state.email.error = translate("error.form.required", {
        type: translate("label.form.email"),
      });
      window.scrollTo(0, 0);
    }
    if (state.phone.value) {
      const valid = isPhone(state.phone.value);
      if (!valid) {
        error = true;
        state.phone.error = translate("error.form.invalid", {
          type: translate("label.form.phone"),
        });
        window.scrollTo(0, 0);
      }
    } else {
      error = true;
      state.phone.error = translate("error.form.required", {
        type: translate("label.form.phone"),
      });
    }
    const storage = Number(state.storageTB) + Number(state.storageGB);
    if (storage === 0) {
      error = true;
      state.storageError = translate("error.form.required", {
        type: translate("label.form.storage"),
      });
    }

    if (!state.editCustomer) {
      if (!state.storageApplications.value) {
        error = true;
        state.storageApplications.error = translate("error.form.required", {
          type: translate("label.form.noofapplications"),
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
      afsPath: state.afsPath.value,
      first_name: state.fname.value,
      last_name: state.lname.value,
      email: state.email.value,
      phone: state.phone.value,
      ...(this.props.selectedCustomer && {
        is_omnicia: this.props.selectedCustomeris_omnicia,
      }),
      tbSpace: state.storageTB || 0,
      gbSpace: state.storageGB || 0,
      max_apps: state.storageApplications.value,
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
      reqObject.primary_user_id =
        _.get(state, "selectedPrimaryContact.user_id") || 0;
      reqObject.is_active = state.statusActive ? 1 : 0;
      this.props.dispatch(
        CustomerActions.editCustomer(reqObject, () => {
          Toast.success("Customer Updated!");
          this.props.history.goBack();
        })
      );
    }
  };

  hasAllZeros = (values) => {
    return _.every(values, (value) => _.toNumber(value) === 0);
  };

  onLicenceValueChange = (type, licence) => (e) => {
    this.setState({
      licences: {
        ...this.state.licences,
        [type]: {
          ...this.state.licences[type],
          [licence.slug]: e.target.value,
        },
        [`${type}Error`]: "",
      },
    });
  };

  closeModal = () => {
    this.setState({
      showDeactivateModal: false,
      openAddNewLicenceModal: false,
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

  onTabChange = (tab) => {
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

  addNewLicence = (licences) => {
    const { selectedCustomer } = this.props;
    const newLicences = _.map(licences, (licence) => ({
      subscription_type_id: licence.application.id,
      subscription_licence_id: licence.duration.id,
      number_of_licences: licence.quantity,
    }));
    this.props.dispatch(
      CustomerActions.addNewLicences(
        {
          customer_id: selectedCustomer.id,
          subscriptions: newLicences,
        },
        () => {
          Toast.success("New License(s) Added!");
          this.onTabChange("subscriptionLicences");
        }
      )
    );
    this.closeModal();
  };

  onPageChange = (pageNo) => {
    this.setState({
      pageNo,
      allLicences: AddCustomer.getItemsBasedOnPagination(
        this.props.allLicences,
        pageNo,
        this.state.itemsPerPage
      ),
    });
  };

  onPageSizeChange = (itemsPerPage) => {
    this.setState({
      itemsPerPage,
      allLicences: AddCustomer.getItemsBasedOnPagination(
        this.props.allLicences,
        this.state.pageNo,
        itemsPerPage
      ),
    });
  };

  sortColumn = (sortBy, orderBy) => {
    const { allLicences } = this.props;
    const sortedLicences = _.orderBy(
      allLicences,
      [sortBy],
      [_.toLower(orderBy)]
    );
    this.setState({
      allLicences: AddCustomer.getItemsBasedOnPagination(
        sortedLicences,
        this.state.pageNo,
        this.state.itemsPerPage
      ),
    });
  };

  updateCustomerDetails = (customer) => {
    const newState = this.populateState(customer);
    const primaryContact = AddCustomer.getPrimaryContactDetailsState(
      this.props,
      this.state,
      customer.primary_user_id
    );
    this.setState(
      {
        ...newState,
        ...primaryContact,
        allLicences: null,
      },
      () => {
        if (this.state.selectedTab === "subscriptionLicences") {
          this.props.dispatch(
            UsermanagementActions.getAllLicences(customer.id)
          );
        }
      }
    );
  };

  onCustomerSelected = (customer) => {
    this.props.dispatch(UsermanagementActions.resetAllLicences());
    this.checkEmptyAfsPath(customer);
    this.props.dispatch(
      CustomerActions.setSelectedCustomer(customer, () => {
        if (customer.is_omnicia === true) {
          this.fetchOmniAdmins(customer, () => {
            this.updateCustomerDetails(customer);
          });
          this.fetchOmniUsers(customer);
        } else {
          this.fetchCustomerAdmins(customer, () => {
            this.updateCustomerDetails(customer);
          });
          this.fetchUsers(customer);
        }
      })
    );
  };

  openUsersModal = (license) => () => {
    this.setState({
      showAssignLicenceToUser: false,
      showUsersModal: true,
      assigningLicence: license,
    });
  };

  goBackToUsersModal = () => {
    this.setState({
      showAssignLicenceToUser: false,
      showUsersModal: true,
    });
  };

  closeUsersModal = () => {
    this.setState({
      selectedUser: null,
      showUsersModal: false,
      assigningLicence: null,
    });
  };

  closeAssignLicenceToUserModal = () => {
    this.setState({
      selectedUser: null,
      showAssignLicenceToUser: false,
    });
  };

  onUserSelect = (user) => {
    this.setState({
      showAssignLicenceToUser: true,
      showUsersModal: false,
      selectedUser: user,
    });
  };

  assignLicence = () => {
    const { assigningLicence, selectedUser } = this.state;
    this.props.dispatch(
      UsermanagementActions.assignLicense(
        {
          ...(_.includes(assigningLicence.type_slug, "view")
            ? { omni_view_license: assigningLicence.id }
            : { omni_file_license: assigningLicence.id }),
          user_id: selectedUser.user_id,
        },
        () => {
          Toast.success(
            `License has been assigned to ${_.get(
              selectedUser,
              "first_name",
              ""
            )} ${_.get(selectedUser, "last_name", "")}`
          );
          this.props.dispatch(UsermanagementActions.resetAllLicences());
          this.setState({ selectedUser: null, allLicences: null }, () => {
            this.props.dispatch(
              UsermanagementActions.getAllLicences(
                this.props.selectedCustomer.id
              )
            );
          });
        }
      )
    );
    this.setState({
      showAssignLicenceToUser: false,
    });
  };

  onPrimaryContactChange = (event) => {
    const userId = event.key;
    this.setState({
      ...AddCustomer.getPrimaryContactDetailsState(
        this.props,
        this.state,
        userId
      ),
      ...(userId === "new" && { disablePrimaryContactFields: false }),
    });
  };

  removeSecContact = (user) => () => {
    Modal.confirm({
      className: "omnimodal",
      title: translate("label.user.seccontact"),
      content: translate("label.user.areyousureremoveseccontact"),
      okText: translate("label.generic.remove"),
      cancelText: translate("label.button.cancel"),
      onOk: () => {
        this.props.dispatch(
          UsermanagementActions.updateSecondaryContacts(
            {
              users: [
                {
                  userId: user.user_id,
                  is_secondary_contact: 0,
                },
              ],
            },
            () => {
              Toast.success("Updated Sceondary Contacts list!");
              this.fetchUsers();
            }
          )
        );
      },
    });
  };

  getDropdownMenu = () => {
    return (
      <Menu
        selectedKeys={[
          `${_.get(this.state, "selectedPrimaryContact.user_id", "")}`,
        ]}
      >
        <Menu.Item key="new" onClick={this.onPrimaryContactChange}>
          Add New Contact
        </Menu.Item>
        <Menu.Divider />
        {_.map(this.props.cAdmins, (item) => (
          <Menu.Item
            key={item.user_id}
            onClick={this.onPrimaryContactChange}
          >{`${item.first_name} ${item.last_name}`}</Menu.Item>
        ))}
      </Menu>
    );
  };

  render() {
    const {
      cname,
      afsPath,
      fname,
      lname,
      email,
      phone,
      storageTB,
      storageGB,
      storageError,
      storageApplications,
      subscription: { omniView, omniFile },
      editCustomer,
      statusActive,
      selectedTab,
      selectedPrimaryContact,
      disablePrimaryContactFields,
      isEmpty,
    } = this.state;
    const { loading, selectedCustomer, users } = this.props;
    const secContacts = _.filter(users, ["is_secondary_contact", true]);
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <Header style={{ marginBottom: "0px" }} />
        <ContentLayout className="addUser">
          {isLoggedInOmniciaAdmin(this.props.role) && editCustomer && (
            <Popover
              trigger="click"
              placement="bottom"
              content={
                <PopoverCustomers
                  onCustomerSelected={this.onCustomerSelected}
                  showAll={false}
                />
              }
            >
              <Row style={{ marginLeft: "auto" }}>
                <Text
                  type="extra_bold"
                  size="20px"
                  className="userManagement-subheader-title"
                  text={_.get(selectedCustomer, "company_name", "")}
                  // onClick={this.goBack}
                />
                <img
                  className="global__cursor-pointer"
                  src="/images/caret-inactive.svg"
                  alt="inactive"
                  style={{ marginLeft: "5px" }}
                />
              </Row>
            </Popover>
          )}
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
                      type: _.toLower(translate("label.dashboard.customer")),
                    })
                  : translate("text.user.addmsg", {
                      type: _.toLower(translate("label.dashboard.customer")),
                    })}
              </p>
              <div className="global__hr-line" />
              <p className="addUser-heading">
                {translate("label.user.details", {
                  type: translate("label.dashboard.company"),
                })}
              </p>
              <Row style={{ justifyContent: "start" }}>
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
                <InputField
                  className="addUser__fields-field"
                  style={{ marginRight: "14px" }}
                  label={`${translate("label.form.afsPath")}*`}
                  value={afsPath.value}
                  placeholder={translate("label.form.afsPath")}
                  error={afsPath.error}
                  onChange={this.onInputChange("afsPath")}
                  disabled={editCustomer && !isEmpty}
                />
              </Row>
              <p className="addUser-heading">
                {translate("label.user.details", {
                  type: translate("label.dashboard.companyprimarycontact"),
                })}
              </p>
              {editCustomer && (
                <div
                  className="addUser__primaryContact global__center-vert"
                  style={{ marginTop: "20px", marginBottom: "20px" }}
                >
                  <Text
                    type="regular"
                    opacity={0.5}
                    textStyle={{ marginRight: "4px" }}
                    size="14px"
                    text={`${translate(
                      "label.dashboard.companyprimarycontact"
                    )}:`}
                  />
                  <Dropdown
                    overlay={this.getDropdownMenu}
                    overlayClassName="addUser__primaryContact-dropdown"
                    trigger={["click"]}
                    className="global__center-vert global__cursor-pointer"
                  >
                    <Row
                      style={{
                        border: "solid 1px",
                        minWidth: "30%",
                        padding: "4px",
                        justifyContent: "space-between",
                        borderRadius: "4px",
                      }}
                    >
                      <Text
                        type="extra_bold"
                        opacity={0.5}
                        textStyle={{ marginRight: "4px" }}
                        size="14px"
                        text={
                          selectedPrimaryContact
                            ? `${_.get(
                                this.state,
                                "selectedPrimaryContact.first_name"
                              )} ${_.get(
                                this.state,
                                "selectedPrimaryContact.last_name"
                              )}`
                            : "Add New Contact"
                        }
                      />
                      <Icon type="down" />
                    </Row>
                  </Dropdown>
                </div>
              )}
              <Row className="addUser__fields">
                <InputField
                  disabled={
                    !!selectedPrimaryContact && disablePrimaryContactFields
                  }
                  className="addUser__fields-field"
                  style={{ marginRight: "14px" }}
                  label={`${translate("label.form.fname")}*`}
                  value={fname.value}
                  placeholder={translate("label.form.fname")}
                  error={fname.error}
                  onChange={this.onInputChange("fname")}
                />
                <InputField
                  disabled={
                    !!selectedPrimaryContact && disablePrimaryContactFields
                  }
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
                  disabled={
                    !!selectedPrimaryContact && disablePrimaryContactFields
                  }
                  className="addUser__fields-field"
                  style={{ marginRight: "14px" }}
                  label={`${translate("label.form.email")}*`}
                  value={email.value}
                  placeholder={translate("placeholder.form.email")}
                  error={email.error}
                  onChange={this.onInputChange("email")}
                />
                <PhoneField
                  disabled={
                    !!selectedPrimaryContact && disablePrimaryContactFields
                  }
                  className="addUser__fields-field"
                  error={phone.error}
                  label={`${translate("label.form.phone")}*`}
                  value={phone.value}
                  onChange={this.onPhoneChange}
                />
              </Row>

              {editCustomer && (
                <React.Fragment>
                  <p className="addUser-heading">
                    {translate("label.user.details", {
                      type: translate(
                        "label.dashboard.companysecondarycontacts"
                      ),
                    })}
                  </p>
                  <Table
                    columns={this.Columns}
                    dataSource={secContacts}
                    pagination={false}
                    style={{
                      marginBottom: "40px",
                      width: "60%",
                      borderTop: "1px solid grey",
                      borderBottom: "1px solid grey",
                    }}
                    scroll={{ y: 200 }}
                  />
                </React.Fragment>
              )}

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
                      type: translate("label.storage.tb"),
                    })}*`}
                    value={storageTB}
                    onChange={this.onStorageChange("storageTB")}
                  />
                  <NumericInput
                    className="addUser__fields-numeric"
                    style={{ marginRight: "14px" }}
                    label={`${translate("label.form.storageof", {
                      type: translate("label.storage.gb"),
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
              tab="Licenses"
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
                {isLoggedInOmniciaAdmin(this.props.role) && (
                  <OmniButton
                    type="add"
                    label={translate("label.button.add", {
                      type: translate("label.licence.licences"),
                    })}
                    onClick={this.openAddNewLicence}
                  />
                )}
              </Row>
              <Subscriptions allLicences={this.props.allLicences} />
            </TabPane>
          </Tabs>

          {this.state.showUsersModal && (
            <AssignLicenceWithUsers
              licence={this.state.assigningLicence}
              selectedUser={this.state.selectedUser}
              closeModal={this.closeUsersModal}
              onUserSelect={this.onUserSelect}
            />
          )}
          <AssignLicence
            visible={this.state.showAssignLicenceToUser}
            licence={this.state.assigningLicence}
            user={this.state.selectedUser}
            closeModal={this.closeAssignLicenceToUserModal}
            back={this.goBackToUsersModal}
            submit={this.assignLicence}
          />
          <DeactivateModal
            isActive={this.state.statusActive}
            visible={this.state.showDeactivateModal}
            title={`${translate("label.usermgmt.deactivateacc")}?`}
            content={translate("text.customer.deactivate")}
            closeModal={this.closeModal}
            submit={this.deactivate}
          />
        </ContentLayout>
        {this.state.openAddNewLicenceModal && (
          <AddNewLicence
            visible={this.state.openAddNewLicenceModal}
            closeModal={this.closeModal}
            addNewLicence={this.addNewLicence}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    allLicences: state.Usermanagement.allLicences,
    selectedCustomer: state.Customer.selectedCustomer,
    cAdmins: state.Usermanagement.cAdmins,
    role: state.Login.role,
    users: state.Usermanagement.users,
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
)(AddCustomer);
