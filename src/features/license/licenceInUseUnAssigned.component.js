import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import { Modal, Dropdown, Icon, Menu } from "antd";
import {
  Text,
  IconText,
  OmniButton,
  ImageLoader,
  Row
} from "../../uikit/components";
import { translate } from "../../translations/translator";
import { CustomerActions } from "../../redux/actions";
import { getFormattedDate } from "../../utils";
import moment from "moment";

class LicenceInUseUnAssigned extends Component {
  constructor(props) {
    super(props);
    this.state = {
      origSubscriptions: [],
      subscriptions: [],
      origLicencesUnAssigned: [],
      licencesUnAssigned: [],
      menuItems: [],
      selectedMenuItem: "",
      duration: "asc",
      expireDate: "desc"
    };
  }

  static propTypes = {
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    type: PropTypes.oneOf(["inuse, unassigned"])
  };

  static getDerivedStateFromProps(props, state) {
    if (props.type === "inuse") {
      if (
        !state.subscriptions.length &&
        _.get(props, "subscriptions.length", 0)
      ) {
        const items = LicenceInUseUnAssigned.getMenu(props.subscriptions);
        return {
          origSubscriptions: props.subscriptions,
          subscriptions: props.subscriptions,
          menuItems: items,
          selectedMenuItem: items[0]
        };
      }
    } else {
      if (
        !state.licencesUnAssigned.length &&
        _.get(props, "licencesUnAssigned.length", 0)
      ) {
        const items = LicenceInUseUnAssigned.getMenu(props.licencesUnAssigned);
        const licencesUnAssigned = LicenceInUseUnAssigned.combineLicences(
          props.licencesUnAssigned
        );
        return {
          licencesUnAssigned,
          origLicencesUnAssigned: licencesUnAssigned,
          menuItems: items,
          selectedMenuItem: items[0]
        };
      }
    }
    return null;
  }

  // grouping all licesnces by name, paurchased date, licence type
  // either standard or pro and by expired date.
  static combineLicences(licences) {
    const combinedLicences = [];
    const licencesByName = _.groupBy(licences, "name");
    _.map(licencesByName, (licences, name) => {
      const licencesByPurchasedDate = _.groupBy(licences, "purchase_date");
      _.map(licencesByPurchasedDate, (licencesByDate, purchaseDate) => {
        const licencesByType = _.groupBy(licencesByDate, "licenceType");
        _.map(licencesByType, (typedLicences, licenceType) => {
          const licencesByExpiredDate = _.groupBy(
            typedLicences,
            "expired_date"
          );
          _.map(licencesByExpiredDate, (licenceList, expiryDate) => {
            const diff = moment(expiryDate).diff(purchaseDate, "days");
            combinedLicences.push({
              name,
              licenceType,
              purchaseDate,
              duration: licenceList[0].duration,
              expiryDate,
              ...(diff <= 30 && { expireInDays: diff }),
              licences: licenceList
            });
          });
        });
      });
    });
    return _.orderBy(combinedLicences, ["duration"]);
  }

  static getMenu = arrayItems => {
    let items = _.keys(_.groupBy(arrayItems, "licenceType"));
    items = _.map(items, (item, idx) => {
      return {
        id: idx,
        value: item
      };
    });
    items.length > 1 && items.unshift({ id: -1, value: "All" });
    return items;
  };

  componentDidMount() {
    const { customer, type } = this.props;
    if (customer) {
      if (type === "inuse") {
        this.props.dispatch(CustomerActions.getSubscriptionsInUse(customer.id));
      } else {
        this.props.dispatch(CustomerActions.getLicences(customer.id));
      }
    }
  }

  componentWillUnmount() {
    this.props.dispatch(CustomerActions.resetLicencesInUseAndUnAssigned());
  }

  orderByDuration = () => {
    const order = this.state.duration === "asc" ? "desc" : "asc";
    let orderedArray =
      this.props.type === "inuse"
        ? this.state.subscriptions
        : this.state.licencesUnAssigned;
    orderedArray = _.orderBy(orderedArray, ["duration"], [order]);
    this.setState({
      duration: order,
      ...(this.props.type === "inuse"
        ? { subscriptions: orderedArray }
        : { licencesUnAssigned: orderedArray })
    });
  };

  orderByExpireDate = () => {
    const order = this.state.duration === "asc" ? "desc" : "asc";
    const orderedArray = _.orderBy(this.state.subscriptions, "expired_date", [
      order
    ]);
    this.setState({ subscriptions: orderedArray, duration: order });
  };

  onMenuClick = item => () => {
    let filtered =
      this.props.type === "inuse"
        ? this.state.origSubscriptions
        : this.state.origLicencesUnAssigned;
    if (item.id !== -1) {
      filtered = _.filter(filtered, ["licenceType", item.value]);
    }
    this.setState({
      selectedMenuItem: item,
      ...(this.props.type === "inuse"
        ? { subscriptions: filtered }
        : { licencesUnAssigned: filtered })
    });
  };

  getDropdownMenu = () => {
    return (
      <Menu selectedKeys={[`${_.get(this.state, "selectedMenuItem.id", "")}`]}>
        {_.map(this.state.menuItems, item => (
          <Menu.Item key={item.id} onClick={this.onMenuClick(item)}>
            {item.value}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  render() {
    const { visible, closeModal, type } = this.props;
    const { subscriptions, licencesUnAssigned, selectedMenuItem } = this.state;
    return (
      <Modal
        destroyOnClose
        visible={visible}
        closable={false}
        footer={null}
        wrapClassName="licence-modal"
      >
        <div className="licence-modal__header">
          <Text
            type="extra_bold"
            size="16px"
            text="Subscription Licenses - In Use"
            text={`${translate("text.customer.subslicences")} - ${_.startCase(
              translate(
                type === "inuse"
                  ? "label.generic.inuse"
                  : "label.generic.unassigned"
              )
            )}`}
          />
          <img
            src="/images/close.svg"
            className="licence-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <div className="global__center-vert" style={{ marginBottom: "15px" }}>
          <Dropdown
            overlay={this.getDropdownMenu}
            trigger={["click"]}
            className="global__center-vert global__cursor-pointer"
          >
            <div>
              <Text
                type="bold"
                opacity={0.5}
                textStyle={{ marginRight: "4px" }}
                size="14px"
                text={`${translate("label.dashboard.applications")}:`}
              />
              <Text
                type="extra_bold"
                opacity={0.5}
                textStyle={{ marginRight: "4px" }}
                size="14px"
                text={_.get(selectedMenuItem, "value", "")}
              />
              <Icon type="down" />
            </div>
          </Dropdown>
          <IconText
            containerStyle={{ marginLeft: "auto", marginRight: "20px" }}
            text={translate("label.licence.duration")}
            image="/images/sort-result.svg"
            imageStyle={{ width: "12px", height: "12px" }}
            onClick={this.orderByDuration}
          />
          {type === "inuse" && (
            <IconText
              text={translate("label.licence.expirationdate")}
              image="/images/sort-result.svg"
              imageStyle={{ width: "12px", height: "12px" }}
              onClick={this.orderByExpireDate}
            />
          )}
        </div>
        <div className="licence-modal__content">
          {type === "inuse" &&
            _.map(subscriptions, subscription => {
              return (
                <div className="licence-modal__content__row">
                  <div>
                    <Text type="bold" size="14px" text={subscription.name} />
                    <Text
                      type="regular"
                      opacity={0.75}
                      size="14px"
                      text={` ${subscription.licenceType} - ${translate(
                        "label.generic.purchased"
                      )} ${getFormattedDate(subscription.purchase_date)}`}
                    />
                  </div>
                  <Row style={{ alignItems: "normal" }}>
                    <ImageLoader
                      type="circle"
                      width="40px"
                      height="40px"
                      path={subscription.profile}
                    />
                    <div style={{ marginLeft: "5px" }}>
                      <Text
                        type="regular"
                        size="14px"
                        text={subscription.first_name}
                      />
                      <Text
                        type="regular"
                        opacity={0.75}
                        size="14px"
                        text={`${translate(
                          "label.usermgmt.expires"
                        )} ${getFormattedDate(subscription.expired_date)}`}
                      />
                    </div>
                  </Row>
                </div>
              );
            })}
          {type === "unassigned" &&
            _.map(licencesUnAssigned, licence => {
              return (
                <div className="licence-modal__content__row">
                  <div>
                    <Text
                      type="bold"
                      size="14px"
                      text={`${licence.licenceType} ${licence.name} (x${
                        licence.licences.length
                      })`}
                    />
                    <Text
                      type="regular"
                      opacity={0.75}
                      size="14px"
                      text={`${translate(
                        "label.generic.purchased"
                      )} ${getFormattedDate(licence.purchase_date)} - `}
                      textStyle={{ display: "inline" }}
                    />
                    <Text
                      type="regular"
                      opacity={0.75}
                      size="14px"
                      text={`${
                        licence.expireInDays
                          ? translate("text.licence.expiresindays", {
                              value: licence.expireInDays
                            })
                          : `${translate(
                              "label.usermgmt.expires"
                            )}  ${getFormattedDate(
                              licence.licences[0].expired_date
                            )}`
                      }`}
                      className="licence-modal__content__row-textred"
                    />
                  </div>
                  <OmniButton
                    type="secondary"
                    label={translate("label.usermgmt.assignlicence")}
                  />
                </div>
              );
            })}
        </div>
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <OmniButton
            label={translate("label.button.done")}
            buttonStyle={{ width: "120px" }}
            onClick={closeModal}
          />
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    subscriptions: state.Customer.subscriptionsInUse,
    licencesUnAssigned: state.Customer.licencesUnAssigned
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
)(LicenceInUseUnAssigned);
