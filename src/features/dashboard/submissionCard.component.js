import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Menu, Avatar } from "antd";
import _ from "lodash";
import moment from "moment";
import { DATE_FORMAT } from "../../constants";

class SubmissionCard extends Component {
  static propTypes = {
    submission: PropTypes.object,
    onSelect: PropTypes.func
  };

  getMenu = () => {
    return (
      <Menu>
        <Menu.Item disabled>
          <span className="submissioncard__heading-dropdown--item">
            Edit User Permissions
          </span>
        </Menu.Item>
        <Menu.Item disabled>
          <span className="submissioncard__heading-dropdown--item red-text">
            Remove Application
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { submission, onSelect } = this.props;
    return (
      <div className="submissioncard">
        <div className="submissioncard__heading">
          <span
            className="submissioncard__heading-text global__cursor-pointer"
            onClick={onSelect && onSelect(submission)}
          >
            {_.get(submission, "name")}
          </span>
          <Dropdown
            overlay={this.getMenu()}
            trigger={["click"]}
            overlayClassName="submissioncard__heading-dropdown"
          >
            <img
              src="/images/overflow.svg"
              className="submissioncard__heading-more"
            />
          </Dropdown>
        </div>
        <div
          className="submissioncard__content"
          onClick={onSelect && onSelect(submission)}
        >
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">
              Added by:
            </span>
            <div style={{ whiteSpace: "nowrap" }}>
              <Avatar size="small" icon="user" />
              <span
                className="submissioncard__content__item-text"
                style={{ marginLeft: "6px" }}
              >
                {_.get(submission, "addedBy", "Corabelle Durrad")}
              </span>
            </div>
          </div>
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">
              Sequences:{" "}
            </span>
            <span className="submissioncard__content__item-text">
              {_.get(submission, "sequence_count", "")}
            </span>
          </div>
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">
              Added On:{" "}
            </span>
            <span className="submissioncard__content__item-text">
              {moment(_.get(submission, "created_at", "12/01/2018")).format(
                DATE_FORMAT
              )}
            </span>
          </div>
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">
              Last Updated:{" "}
            </span>
            <span className="submissioncard__content__item-text">
              {moment(_.get(submission, "updated_at", "12/01/2018")).format(
                DATE_FORMAT
              )}
            </span>
          </div>
          <div className="global__hr-line" style={{ marginTop: "20px" }} />
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">Users:</span>
            <div>
              <Avatar size="small" icon="user" />
              <Avatar size="small" icon="user" />
              <Avatar size="small" icon="user" />
              <Avatar size="small" icon="user" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SubmissionCard;