import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Menu } from "antd";
import _ from "lodash";

class CustomerCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overflowIconClicked: false
    };
  }

  static propTypes = {
    customer: PropTypes.object,
    onSelect: PropTypes.func
  };

  getMenu = () => {
    return (
      <Menu>
        <Menu.Item disabled>
          <span className="customercard__heading-dropdown--item">
            Edit Customer
          </span>
        </Menu.Item>
        <Menu.Item disabled>
          <span className="customercard__heading-dropdown--item">
            Add/Edit Users
          </span>
        </Menu.Item>
        <Menu.Item disabled>
          <span className="customercard__heading-dropdown--item red-text">
            Deactivate Customer
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  getName = customer => {
    const name = _.get(customer, "company_name", "");
    return name.length > 32 ? `${name.substring(0, 33)} ...` : name;
  };

  onDropdownClick = visible => {
    this.setState({ overflowIconClicked: visible });
  };

  render() {
    const { customer, onSelect } = this.props;
    return (
      <div className="customercard">
        <div className="customercard__heading">
          <span
            className="customercard__heading-text global__cursor-pointer"
            onClick={onSelect && onSelect(customer)}
          >
            {this.getName(customer)}
          </span>
          <Dropdown
            overlay={this.getMenu()}
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
        </div>
        <div
          className="customercard__content"
          onClick={onSelect && onSelect(customer)}
        >
          <div className="customercard__content__item">
            <img src="/images/users.svg" />
            <span className="customercard__content__item-text">
              {_.get(customer, "number_of_users", "0")} users
            </span>
          </div>
          <div className="global__hr-line" />
          <div className="customercard__content__item">
            <img src="/images/applications.svg" />
            <span className="customercard__content__item-text">
              {_.get(customer, "number_of_submissions", "0")} applications
            </span>
          </div>
          <div className="global__hr-line" />
          <div className="customercard__content__item">
            <img src="/images/database.svg" />
            <span className="customercard__content__item-text">
              {_.get(customer, "max_space") || "0"} TB
            </span>
          </div>
          <div className="global__hr-line" />
          <div className="customercard__content__item">
            <img src="/images/key.svg" />
            <span
              className="customercard__content__item-text"
              style={{ fontSize: "14px" }}
            >
              Subscription Licences:
            </span>
            <span className="customercard__content__item-subtext">
              12 in use | 3 unassigned
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default CustomerCard;
