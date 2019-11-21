import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Menu, Avatar } from "antd";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";
import { Text, Row } from "../../uikit/components";
import { ApplicationApi } from "../../redux/api";
import styled from "styled-components";
const Column = styled.div`
  width: ${props => props.width};
`;
class SubmissionCard extends Component {
  static propTypes = {
    submission: PropTypes.object,
    onSelect: PropTypes.func,
    onMenuItemClick: PropTypes.func,
    customer: PropTypes.object
  };

  checkSequenceStatus = (data, submission) => {
    let sequenceStatus = data.filter(seq => !seq.status);
    if(sequenceStatus && !sequenceStatus.length) {
      if(this.interval) {
        clearInterval(this.interval);
      }
      submission.sequence_failed = data.filter(seq => seq.status == 1);
      submission.sequence_success = data.filter(seq => seq.status == 2);
      submission.sequence_count = data.length;
      this.props.updateSubmissions(submission);
    } else {
      submission.sequence_inProgress = data.filter(seq => !seq.status);
      submission.sequence_failed = data.filter(seq => seq.status == 1);
      submission.sequence_success = data.filter(seq => seq.status == 2);
      this.props.updateSubmissions(submission);
    }
  };

  moniorStatus = () => {
    const res = ApplicationApi.monitorStatus({
      submission_id: this.props.submission.id
    }).then((data) => {
      if(data && data.data && data.data.result.length) {
        this.checkSequenceStatus(data.data.result, this.props.submission);
      } else {
        if(this.interval) {
          clearInterval(this.interval);
        }
      }
    });
  }
  
  componentDidMount() {
    this.idx = 0;
    if(this.props.submission.sequence_count == 0) {
      this.moniorStatus();
      this.interval = setInterval(() => {
        this.moniorStatus();
      }, 15000); 
    }
  }

  componentWillUnmount() {
     if (this.interval) {
      clearTimeout(this.interval)
      }
  }

  render() {
    const { submission, onSelect, getMenu, customer } = this.props;
    const uploading = _.get(submission, "sequence_count", 0) == 0;
    const submissionFailedCount = submission.sequence_failed && submission.sequence_failed.length;
    return (
      <div
        className="submissioncard"
        style={{ ...((uploading || (submission.sequence_failed && submission.sequence_failed.length)) && { cursor: "not-allowed" }) }}
      >
        <div className="submissioncard__heading">
          <span
            className="submissioncard__heading-text global__cursor-pointer"
            style={{ ...((uploading || (submission.sequence_failed && submission.sequence_failed.length)) && { cursor: "not-allowed" }) }}
            onClick={onSelect && onSelect(submission)}
          >
            {_.get(submission, "name")}
          </span>
          {!uploading && (
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
          )}
        </div>
        <div
          className="submissioncard__content"
          style={{ ...((uploading || (submission.sequence_failed && submission.sequence_failed.length)) && { cursor: "not-allowed" }) }}
          onClick={onSelect && onSelect(submission)}
        >
          {uploading && (
            <React.Fragment>
              <div style={{height: '30%', padding: '10px'}}>
                <Text type="medium" textStyle={{ color: '#00d592' }} text={`Sequence Success: ${submission.sequence_success ? submission.sequence_success.length : 0}`} />
                <Text type="medium" textStyle={{ color: 'red' }} text={`Sequence Failed: ${submission.sequence_failed ? submission.sequence_failed.length : 0}`} />
                <Text type="medium" textStyle={{ color: 'gray' }} text={`Sequence In Progress: ${submission.sequence_inProgress ? submission.sequence_inProgress.length : 0}`} />
              </div>
            </React.Fragment>
          )}
          {!uploading && submission.sequence_failed && submission.sequence_failed.length ? (
            <Row style={{height: '100%'}}>
              <Text type="medium" textStyle={{ color: 'red' }} text="Submission Failed"/>
            </Row>
          ) : null}
          {!uploading && (!submission.sequence_failed || !submission.sequence_failed.length) ? (
            <React.Fragment>
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
                    {_.get(submission, "created_by") || "Corabelle Durrad"}
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
            </React.Fragment>
          ) : null}
        </div>
      </div>
    );
  }
}

export default SubmissionCard;
