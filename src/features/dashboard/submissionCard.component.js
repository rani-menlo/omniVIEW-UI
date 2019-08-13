import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Menu, Avatar } from "antd";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";

class SubmissionCard extends Component {
  static propTypes = {
    submission: PropTypes.object,
    onSelect: PropTypes.func,
    onMenuItemClick: PropTypes.func,
    customer: PropTypes.object
  };

  render() {
    const { submission, onSelect, getMenu, customer } = this.props;
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
            overlay={getMenu && getMenu()}
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
              {translate("label.dashboard.addedby")}
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
              {translate("label.dashboard.sequences")}:
            </span>
            <span className="submissioncard__content__item-text">
              {_.get(submission, "sequence_count", "")}
            </span>
          </div>
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">
              {translate("label.dashboard.addedon")}:
            </span>
            <span className="submissioncard__content__item-text">
              {getFormattedDate(_.get(submission, "created_at")) ||
                "12/01/2018"}
            </span>
          </div>
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">
              {translate("label.dashboard.lastupdated")}:
            </span>
            <span className="submissioncard__content__item-text">
              {getFormattedDate(_.get(submission, "updated_at")) ||
                "12/01/2018"}
            </span>
          </div>
          <div className="submissioncard__content__item">
            <span className="submissioncard__content__item-label">
              {translate("label.dashboard.submissioncenter")}:
            </span>
            <span className="submissioncard__content__item-text">
              {_.get(submission, "submission_center", "")}
            </span>
          </div>
          <div className="global__hr-line" style={{ marginTop: "20px" }} />
          <div
            className="submissioncard__content__item"
            style={{ paddingTop: "4px" }}
          >
            <span className="submissioncard__content__item-label">
              {translate("label.dashboard.users")}:
            </span>
            <div>{customer.number_of_users}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default SubmissionCard;
