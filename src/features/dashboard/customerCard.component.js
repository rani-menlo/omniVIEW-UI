import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Menu } from "antd";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { isLoggedInOmniciaAdmin } from "../../utils";

class CustomerCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overflowIconClicked: false
    };
  }

  static propTypes = {
    customer: PropTypes.object,
    getMenu: PropTypes.func,
    onSelect: PropTypes.func
  };

  getName = customer => {
    const name = _.get(customer, "company_name", "");
    return name.length > 32 ? `${name.substring(0, 33)} ...` : name;
  };

  onDropdownClick = visible => {
    this.setState({ overflowIconClicked: visible });
  };

  render() {
    const {
      customer,
      onSelect,
      getMenu,
      subscriptionsInUse,
      subscriptionsUnAssigned,
      role
    } = this.props;
    return (
      <div
        className="customercard"
        style={{ opacity: _.get(customer, "is_active", false) ? 1 : 0.5 }}
      >
        <div className="customercard__heading">
          <span
            className="customercard__heading-text global__cursor-pointer"
            onClick={onSelect && onSelect(customer)}
          >
            {this.getName(customer)}
          </span>
          {isLoggedInOmniciaAdmin(role) && (
            <Dropdown
              overlay={getMenu && getMenu()}
              trigger={["click"]}
              overlayClassName="customercard__heading-dropdown"
              onVisibleChange={this.onDropdownClick}
            >
              <img
                src={`/images/overflow${
                  this.state.overflowIconClicked ? "-selected" : ""
                }.svg`}
                className="customercard__heading-more"
              />
            </Dropdown>
          )}
        </div>
        <div
          className="customercard__content"
          onClick={onSelect && onSelect(customer)}
        >
          <div className="customercard__content__item">
            <img src="/images/users.svg" />
            <span className="customercard__content__item-text">
              {`${_.get(customer, "number_of_users", "0")} ${_.toLower(
                translate("label.dashboard.users")
              )}`}
            </span>
          </div>
          <div className="global__hr-line" />
          <div className="customercard__content__item">
            <img src="/images/applications.svg" />
            <span className="customercard__content__item-text">
              {`${_.get(customer, "number_of_submissions", "0")} ${_.toLower(
                translate("label.dashboard.applications")
              )}`}
            </span>
          </div>
          <div className="global__hr-line" />
          <div className="customercard__content__item">
            <img src="/images/database.svg" />
            <span className="customercard__content__item-text">
              {`${_.get(customer, "max_space") || "0"} ${translate(
                "label.storage.tb"
              )}`}
            </span>
          </div>
          <div className="global__hr-line" />
          <div className="customercard__content__item">
            <img src="/images/key.svg" />
            <span
              className="customercard__content__item-text"
              style={{ fontSize: "14px" }}
            >
              {translate("label.dashboard.subscription")}:
            </span>
            {isLoggedInOmniciaAdmin(role) && (
              <p style={{ marginLeft: "13px", paddingLeft: "20px" }}>
                <span onClick={subscriptionsInUse(customer)}>
                  {`${_.get(customer, "assigned_licenses", 0)} ${translate(
                    "label.generic.inuse"
                  )} | `}
                </span>
                <span onClick={subscriptionsUnAssigned(customer)}>{`${_.get(
                  customer,
                  "revoked_licenses",
                  0
                ) + _.get(customer, "unassigned_licenses", 0)} ${translate(
                  "label.generic.unassigned"
                )}`}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default CustomerCard;
