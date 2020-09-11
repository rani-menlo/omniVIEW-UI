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
  ImageLoader,
} from "../../uikit/components";
import { ApplicationApi } from "../../redux/api";
import {
  POLLING_INTERVAL,
  UPLOAD_SUCCESS,
  UPLOAD_INPROGRES,
  UPLOAD_FAILED,
  ANALYZING,
  UPLOAD_PROCESSING,
  SCRIPT_ERROR,
} from "../../constants";
import { ApiActions } from "../../redux/actions";

class SubmissionCard extends Component {
  static propTypes = {
    submission: PropTypes.object,
    onSelect: PropTypes.func,
    onMenuItemClick: PropTypes.func,
    customer: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.interval = null;
    this.state = {
      reportData: [],
      openFailuresModal: false,
      selectedRows: [],
      crossRefs: false,
    };
    this.Columns = [
      {
        title: "Sequence #",
        dataIndex: "pipeline_name",
        key: "id",
        render: (text) => (
          <Text type="regular" size="14px" text={text || 1001} />
        ),
        width: 110,
      },

      {
        title: "Error Description",
        dataIndex: "error_message",
        key: "error",
        render: (text) => (
          <Text
            type="regular"
            size="14px"
            text={text}
            textStyle={{ wordWrap: "break-word", wordBreak: "break-word" }}
          />
        ),
      },
    ];
  }

  openFailures = async () => {
    this.props.dispatch(ApiActions.requestOnDemand());
    const res = await ApplicationApi.monitorStatus({
      submission_id: this.props.submission.id,
    });
    const { data } = res;
    const failures = _.filter(
      _.get(data, "result"),
      (seq) => seq.status == UPLOAD_FAILED
    );
    this.setState({
      reportData: failures,
      openFailuresModal: true,
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

  //Opens this modal to display the cross referenced sequences
  openCrossrefsModal = (e) => {
    e.stopPropagation();
    if (this.state.crossRefs) {
      return;
    }
    this.setState({ crossRefs: true });
  };

  closeCrossrefsModal = (e) => {
    e.stopPropagation();
    this.setState({ crossRefs: false }, () => {
      e.stopPropagation();
    });
  };

  render() {
    const {
      submission,
      onSelect,
      getMenu,
      customer,
      openFailures,
    } = this.props;
    const { crossRefs } = this.state;
    const uploading = _.get(submission, "is_uploading");
    const is_submission = _.get(submission, "is_submission");
    const is_deleting = _.get(submission, "is_deleting");
    const LazyImageLoader = React.lazy(() =>
      import("../../uikit/components/image/imageLoader.component")
    );
    return (
      <React.Fragment>
        <div
          className="submissioncard"
          style={{
            ...((uploading || submission.analyzing || is_deleting) && {
              cursor: "not-allowed",
            }),
          }}
        >
          {/* Heading of the application card */}
          <div className="submissioncard__heading">
            <span
              className="submissioncard__heading-text global__cursor-pointer"
              style={{
                ...((uploading || submission.analyzing || is_deleting) && {
                  cursor: "not-allowed",
                }),
              }}
              onClick={onSelect && onSelect(submission)}
            >
              {_.get(submission, "name")}
            </span>
            {!uploading && !submission.analyzing && !is_deleting && (
              <Dropdown
                overlay={getMenu && getMenu()}
                trigger={["click"]}
                onClick={getMenu}
                overlayClassName="submissioncard__heading-dropdown"
              >
                <img
                  src="/images/overflow.svg"
                  className="submissioncard__heading-more"
                />
              </Dropdown>
            )}
          </div>
          {/* Content of the application card */}
          <div
            className="submissioncard__content"
            style={{
              ...((uploading ||
                submission.analyzing ||
                is_deleting ||
                (_.get(submission, "sequence_failed.length") &&
                  is_submission == 1) ||
                // _.get(submission, "sequence_failed.length") ==
                //   _.get(submission, "sequence_count") ||
                "") && {
                cursor: "not-allowed",
              }),
            }}
            onClick={onSelect && onSelect(submission)}
          >
            {/* When uploading multiple submissions via site to site connector,
            in the backend pre-validations will be done, so till the time we need
            to show the message "Validation is in progress" as part of the story OMNG-1100, Sprint-32 */}
            {submission.sequence_count === 0 && (
              <React.Fragment>
                <div style={{ padding: "10px" }}>
                  <Text
                    type="medium"
                    textStyle={{ marginTop: "30%", textAlign: "center" }}
                    text="Validation is in progress..."
                  />
                </div>
              </React.Fragment>
            )}
            {/* when delete sequences is inprogress displaying below block */}
            {is_deleting && (
              <React.Fragment>
                <div style={{ padding: "10px" }}>
                  <Text
                    type="medium"
                    textStyle={{ marginTop: "30%", textAlign: "center" }}
                    text="Delete Sequence(s) is in progress..."
                  />
                </div>
              </React.Fragment>
            )}
            {(uploading ||
              submission.analyzing ||
              (_.get(submission, "sequence_failed.length") &&
                is_submission == 1) ||
              "") &&
              !is_deleting &&
              submission.sequence_count !== 0 && (
                <React.Fragment>
                  <div style={{ padding: "10px" }}>
                    {/* Displaying uploaded sequences by total sequences */}
                    {(_.get(submission, "sequence_inProgress.length") ||
                      "") && (
                      <Text
                        type="medium"
                        textStyle={{ color: "#00d592" }}
                        text={`Sequences Uploaded: ${_.get(
                          submission,
                          "sequence_success.length",
                          0
                        ) +
                          _.get(
                            submission,
                            "sequence_processing.length",
                            0
                          )} / ${_.get(submission, "sequence_count", 0)}`}
                      />
                    )}
                    {/* Displaying processing sequences and sucess sequences by total sequences when there are no pending sequences */}
                    {!(
                      _.get(submission, "sequence_inProgress.length") || ""
                    ) && (
                      <Text
                        type="medium"
                        textStyle={{ color: "#00d592" }}
                        text={`Sequences Uploaded: ${_.get(
                          submission,
                          "sequence_success.length",
                          0
                        ) +
                          _.get(
                            submission,
                            "sequence_processing.length",
                            0
                          )} / ${_.get(submission, "sequence_count", 0)}`}
                      />
                    )}
                    {/* Displaying Failed Sequences */}
                    {/* {(_.get(submission, "sequence_failed.length") || "") && ( */}
                    {/* {_.get(submission, "sequence_failed.length") ==
                    _.get(submission, "sequence_count") && ( */}
                    <Text
                      type="medium"
                      textStyle={{ color: "red" }}
                      text={`Sequences Failed: ${_.get(
                        submission,
                        "sequence_failed.length",
                        0
                      )}`}
                    />
                    {/* )} */}
                    {/* )} */}
                    {submission.analyzing &&
                      !(_.get(submission, "sequence_failed.length") || "") && (
                        <Text
                          type="medium"
                          textStyle={{ marginTop: "12%", textAlign: "center" }}
                          text="Processing uploaded sequence(s)..."
                        />
                      )}
                    {uploading &&
                      !submission.analyzing &&
                      (_.get(submission, "sequence_inProgress.length") ||
                        "") && (
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
                        onClick={openFailures}
                        type="danger"
                        buttonStyle={{ borderColor: "unset" }}
                      />
                    )}
                </React.Fragment>
              )}
            {/* Sequence is uploaded successfully (or) process of deleting sequences is done and able to access the application */}
            {!uploading &&
              !submission.analyzing &&
              // !(
              //   submission.sequence_failed && submission.sequence_failed.length
              // ) &&
              is_submission == 0 &&
              !is_deleting && (
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
                          textAlign: "right",
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
                      {_.get(submission, "sequence_count", 0)}
                    </span>
                    {_.get(submission, "broken_x_ref", "") != 0 &&
                      !(
                        submission.sequence_failed &&
                        submission.sequence_failed.length
                      ) && (
                        <span className="submissioncard__content__item-text-crossreficon">
                          <img
                            src="/images/info_icon.png"
                            className=""
                            onClick={this.openCrossrefsModal}
                          />
                        </span>
                      )}
                    {_.get(submission, "sequence_failed") &&
                      _.get(submission, "sequence_failed.length") != 0 && (
                        <span className="submissioncard__content__item-text-crossreficon">
                          <img
                            src="/images/error.png"
                            className=""
                            onClick={openFailures}
                          />
                        </span>
                      )}
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
        {/* Cross referenced sequences info */}
        <Modal
          destroyOnClose
          visible={crossRefs}
          closable={false}
          footer={null}
          width="45%"
          centered
        >
          <div
            className="licence-modal__header"
            style={{ marginBottom: "15px" }}
          >
            <Text
              type="extra_bold"
              size="16px"
              text="Information: Cross-referenced Sequences Not Found"
            />
            <img
              src="/images/close.svg"
              className="licence-modal__header-close"
              onClick={this.closeCrossrefsModal}
            />
          </div>
          <p>
            {_.get(submission, "broken_x_ref", "") == 1
              ? `A Sequence in the Application has a cross-reference to another Sequence that is not yet uploaded`
              : `${_.get(
                  submission,
                  "broken_x_ref",
                  ""
                )} Sequences in the Application have the cross-references to other Sequences that are not yet uploaded`}
          </p>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <OmniButton label="Close" onClick={this.closeCrossrefsModal} />
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect()(SubmissionCard);
