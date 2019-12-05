import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Dropdown, Menu, Avatar, Modal, Table } from "antd";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";
import { Text, Row, OmniButton, Loader } from "../../uikit/components";
import { ApplicationApi } from "../../redux/api";
import {
  POLLING_INTERVAL,
  UPLOAD_SUCCESS,
  UPLOAD_INPROGRES,
  UPLOAD_FAILED
} from "../../constants";
import { ApiActions } from "../../redux/actions";

class SubmissionCard extends Component {
  static propTypes = {
    submission: PropTypes.object,
    onSelect: PropTypes.func,
    onMenuItemClick: PropTypes.func,
    customer: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.interval = null;
    this.state = {
      reportData: [],
      openFailuresModal: false,
      selectedRows: []
    };
    this.Columns = [
      {
        title: "Sequence #",
        dataIndex: "id",
        key: "id",
        render: text => <Text type="regular" size="14px" text={text || 1001} />,
        width: 150
      },

      {
        title: "Error Description",
        dataIndex: "error_message",
        key: "error",
        render: text => (
          <Text
            type="regular"
            size="14px"
            text={text}
            textStyle={{ wordWrap: "break-word", wordBreak: "break-word" }}
          />
        )
      }
    ];
  }

  checkSequenceStatus = (data, submission) => {
    let noUploadInProgress = _.every(
      data,
      seq => seq.status != UPLOAD_INPROGRES
    );
    if (noUploadInProgress) {
      this.interval && clearInterval(this.interval);
      if (!_.get(submission, "sequence_failed.length", 0)) {
        submission.sequence_count = data.length;
      }
    }
    submission.sequence_inProgress = _.filter(
      data,
      seq => seq.status == UPLOAD_INPROGRES
    );
    submission.sequence_failed = _.filter(
      data,
      seq => seq.status == UPLOAD_FAILED
    );
    submission.sequence_success = _.filter(
      data,
      seq => seq.status == UPLOAD_SUCCESS
    );
    this.props.updateSubmissions(submission);
  };

  startPolling = async () => {
    const res = await ApplicationApi.monitorStatus({
      submission_id: this.props.submission.id
    });
    if (res) {
      const { data } = res;
      if (_.get(data, "result.length", 0)) {
        this.checkSequenceStatus(
          _.get(data, "result", null),
          this.props.submission
        );
      } else {
        this.interval && clearInterval(this.interval);
      }
    }
  };

  componentDidMount() {
    if (this.props.submission.sequence_count == 0) {
      this.startPolling();
      this.interval = setInterval(() => {
        this.startPolling();
      }, POLLING_INTERVAL);
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearTimeout(this.interval);
    }
  }

  openFailures = async () => {
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await ApplicationApi.monitorStatus({
      submission_id: this.props.submission.id
    });
    const { data } = res;
    const failures = _.filter(
      _.get(data, "result"),
      seq => seq.status == UPLOAD_FAILED
    );
    this.setState({
      reportData: failures,
      openFailuresModal: true
    });
    this.props.dispatch(ApiActions.successOnDemand());
  };

  closeFailuresModal = () => {
    this.setState({ openFailuresModal: false });
  };

  retryUpload = () => {
    this.props.retryUpload(this.state.selectedRows);
    this.setState({ openFailuresModal: false });
  };

  render() {
    const { submission, onSelect, getMenu, customer } = this.props;
    const { openFailuresModal, reportData, selectedRows } = this.state;
    const uploading = _.get(submission, "sequence_count", 0) == 0;
    return (
      <React.Fragment>
        {/* <Loader loading={loading} /> */}
        <div
          className="submissioncard"
          style={{
            ...((uploading ||
              (submission.sequence_failed &&
                submission.sequence_failed.length)) && {
              cursor: "not-allowed"
            })
          }}
        >
          <div className="submissioncard__heading">
            <span
              className="submissioncard__heading-text global__cursor-pointer"
              style={{
                ...((uploading ||
                  (submission.sequence_failed &&
                    submission.sequence_failed.length)) && {
                  cursor: "not-allowed"
                })
              }}
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
            style={{
              ...((uploading ||
                (submission.sequence_failed &&
                  submission.sequence_failed.length)) && {
                cursor: "not-allowed"
              })
            }}
            onClick={onSelect && onSelect(submission)}
          >
            {uploading && (
              <React.Fragment>
                <div style={{ height: "30%", padding: "10px" }}>
                  <Text
                    type="medium"
                    textStyle={{ color: "gray" }}
                    text={`Sequences Remaining: ${_.get(
                      submission,
                      "sequence_inProgress.length",
                      0
                    )}`}
                  />
                  <Text
                    type="medium"
                    textStyle={{ color: "#00d592" }}
                    text={`Sequences Uploaded: ${_.get(
                      submission,
                      "sequence_success.length",
                      0
                    )}`}
                  />
                  <Text
                    type="medium"
                    textStyle={{ color: "red" }}
                    text={`Sequences Failed: ${_.get(
                      submission,
                      "sequence_failed.length",
                      0
                    )}`}
                  />
                </div>
                {!_.get(submission, "sequence_inProgress.length") &&
                  _.get(submission, "sequence_failed.length") && (
                    <OmniButton
                      className="submissioncard__content-report"
                      label="View Report"
                      onClick={this.openFailures}
                      type="danger"
                    />
                  )}
              </React.Fragment>
            )}
            {!uploading && (
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
                <div
                  className="global__hr-line"
                  style={{ marginTop: "20px" }}
                />
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
            )}
          </div>
          <Modal
            destroyOnClose
            visible={openFailuresModal}
            closable={false}
            footer={null}
            width="50%"
          >
            <div
              className="licence-modal__header"
              style={{ marginBottom: "15px" }}
            >
              <Text type="extra_bold" size="16px" text="Failure Report" />
              <img
                src="/images/close.svg"
                className="licence-modal__header-close"
                onClick={this.closeFailuresModal}
              />
            </div>
            <Table
              columns={this.Columns}
              dataSource={reportData}
              pagination={false}
              rowSelection={{
                onChange: (selectedRowKeys, selectedRows) => {
                  this.setState({ selectedRows });
                }
              }}
              scroll={{ y: 200 }}
            />
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <OmniButton
                type="secondary"
                label={translate("label.button.cancel")}
                onClick={this.closeFailuresModal}
                buttonStyle={{ width: "120px", marginRight: "12px" }}
              />
              <OmniButton
                disabled={!selectedRows.length}
                label="Retry"
                buttonStyle={{ width: "120px", marginRight: "10px" }}
                onClick={this.retryUpload}
              />
            </div>
          </Modal>
        </div>
      </React.Fragment>
    );
  }
}

export default connect()(SubmissionCard);
