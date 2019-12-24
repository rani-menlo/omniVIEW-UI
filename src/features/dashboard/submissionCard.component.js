import React, { Component, Suspense } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Dropdown, Menu, Avatar, Modal, Table } from "antd";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";
import {
  Text,
  Row,
  OmniButton,
  Loader,
  ImageLoader
} from "../../uikit/components";
import { ApplicationApi } from "../../redux/api";
import {
  POLLING_INTERVAL,
  UPLOAD_SUCCESS,
  UPLOAD_INPROGRES,
  UPLOAD_FAILED,
  ANALYZING,
  UPLOAD_PROCESSING,
  UPLOAD_INPROGRES_EXTRA
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
        dataIndex: "pipeline_name",
        key: "id",
        render: text => <Text type="regular" size="14px" text={text || 1001} />,
        width: 110
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
    const totalNoOfSeq = data.length;
    const inProgress = [];
    const failed = [];
    const success = [];
    const processing = [];
    _.map(data, seq => {
      switch (seq.status) {
        case UPLOAD_INPROGRES:
        case UPLOAD_INPROGRES_EXTRA:
          inProgress.push(seq);
          break;
        case UPLOAD_FAILED:
          failed.push(seq);
          break;
        case UPLOAD_SUCCESS:
          success.push(seq);
          break;
        case UPLOAD_PROCESSING:
          processing.push(seq);
          break;
      }
    });
    submission.sequence_count = totalNoOfSeq;
    submission.sequence_inProgress = inProgress;
    submission.sequence_failed = failed;
    submission.sequence_success = success;
    submission.sequence_processing = processing;
    if (!inProgress.length && processing.length) {
      submission.analyzing = true;
    }
    // if all are processing(Complete) or failed then clear interval
    if (processing.length == totalNoOfSeq || failed.length == totalNoOfSeq) {
      submission.is_uploading = false;
      submission.analyzing = false;
      this.interval && clearInterval(this.interval);
    }
    this.props.updateSubmissions(submission);

    /* let analyzing = _.some(data, seq => seq.status == ANALYZING);
    submission.analyzing = analyzing;
    let allAnalyzed = _.every(data, seq => seq.status == ANALYZING);
    let allFailed = _.every(data, seq => seq.status == UPLOAD_FAILED);
    // if all analyzed then only it's complete, if all failed then stop polling
    if (allAnalyzed || allFailed || !submission.sequence_inProgress.length) {
      submission.analyzing = allAnalyzed || analyzing;
      this.interval && clearInterval(this.interval);
      if (!_.get(submission, "sequence_failed.length", 0)) {
        submission.sequence_count = data.length;
        submission.is_uploading = false;
      }
      this.props.updateSubmissions(submission);
    } else {
      this.props.updateUploadProgress(submission);
    } */
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
    /* if (this.props.submission.is_uploading) {
      this.startPolling();
      this.interval = setInterval(() => {
        this.startPolling();
      }, POLLING_INTERVAL);
    } */
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
    const uploading = _.get(submission, "is_uploading");
    const LazyImageLoader = React.lazy(() =>
      import("../../uikit/components/image/imageLoader.component")
    );
    return (
      <React.Fragment>
        <div
          className="submissioncard"
          style={{
            ...((uploading ||
              submission.analyzing ||
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
                  submission.analyzing ||
                  (submission.sequence_failed &&
                    submission.sequence_failed.length)) && {
                  cursor: "not-allowed"
                })
              }}
              onClick={onSelect && onSelect(submission)}
            >
              {_.get(submission, "name")}
            </span>
            {!uploading &&
              !submission.analyzing &&
              !(_.get(submission, "sequence_failed.length") || "") && (
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
                submission.analyzing ||
                _.get(submission, "sequence_failed.length") ||
                "") && {
                cursor: "not-allowed"
              })
            }}
            onClick={onSelect && onSelect(submission)}
          >
            {(uploading ||
              submission.analyzing ||
              _.get(submission, "sequence_failed.length") ||
              "") && (
              <React.Fragment>
                <div style={{ padding: "10px" }}>
                  {(_.get(submission, "sequence_inProgress.length") || "") && (
                    <Text
                      type="medium"
                      textStyle={{ color: "gray" }}
                      text={`Sequences Remaining: ${_.get(
                        submission,
                        "sequence_inProgress.length",
                        0
                      )}`}
                    />
                  )}
                  <Text
                    type="medium"
                    textStyle={{ color: "#00d592" }}
                    text={`Sequences Uploaded: ${_.get(
                      submission,
                      "sequence_success.length",
                      0
                    ) + _.get(submission, "sequence_processing.length", 0)}`}
                  />
                  {(_.get(submission, "sequence_failed.length") || "") && (
                    <Text
                      type="medium"
                      textStyle={{ color: "red" }}
                      text={`Sequences Failed: ${_.get(
                        submission,
                        "sequence_failed.length",
                        0
                      )}`}
                    />
                  )}
                  {submission.analyzing && (
                    <Text
                      type="medium"
                      textStyle={{ marginTop: "12%", textAlign: "center" }}
                      text="Processing uploaded sequence(s)..."
                    />
                  )}
                  {uploading &&
                    !submission.analyzing &&
                    !_.get(submission, "sequence_failed.length") && (
                      <Text
                        type="medium"
                        textStyle={{ marginTop: "12%", textAlign: "center" }}
                        text="Upload is in progress..."
                      />
                    )}
                </div>
                {_.get(submission, "sequence_inProgress.length") == 0 &&
                  _.get(submission, "sequence_failed.length") != 0 && (
                    <OmniButton
                      className="submissioncard__content-report"
                      label="View Report"
                      onClick={this.openFailures}
                      type="danger"
                      buttonStyle={{ borderColor: "unset" }}
                    />
                  )}
              </React.Fragment>
            )}
            {!uploading &&
              !submission.analyzing &&
              !(
                submission.sequence_failed && submission.sequence_failed.length
              ) && (
                <React.Fragment>
                  <div className="submissioncard__content__item">
                    <p className="submissioncard__content__item-label">
                      {translate("label.dashboard.addedby")}
                    </p>
                    <div
                      style={{ marginTop: "10px" }}
                      className="global__center-vert"
                    >
                      <Suspense fallback={<p>Loading...</p>}>
                        <LazyImageLoader
                          type="circle"
                          width="30px"
                          height="30px"
                          path={submission.profile}
                        />
                      </Suspense>
                      <div
                        className="submissioncard__content__item-text"
                        style={{
                          whiteSpace: "nowrap",
                          marginLeft: "6px",
                          maxWidth: "90px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "right"
                        }}
                        title={_.get(submission, "created_by", "")}
                      >
                        {_.get(submission, "created_by", "")}
                      </div>
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
        </div>
      </React.Fragment>
    );
  }
}

export default connect()(SubmissionCard);
