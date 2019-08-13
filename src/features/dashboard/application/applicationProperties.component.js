import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import { Modal, Dropdown, Icon, Menu } from "antd";
import { Text, Row, OmniButton } from "../../../uikit/components";
import { translate } from "../../../translations/translator";
import { ApplicationActions } from "../../../redux/actions";

class ApplicationProperties extends Component {
  static propTypes = {
    closeModal: PropTypes.func,
    submit: PropTypes.func
  };

  static getDerivedStateFromProps(props, state) {
    if (
      !_.get(state, "submissionCenters.length") &&
      _.get(props, "submissionCenters.length")
    ) {
      return {
        selectedSubmissionCenter: _.get(
          props,
          "selectedSubmission.submission_center"
        ),
        submissionCenters: props.submissionCenters
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      submissionCenters: [],
      selectedSubmissionCenter: null
    };
  }

  componentDidMount() {
    this.props.dispatch(ApplicationActions.getSubmissionCenters());
  }

  onMenuClick = event => {
    this.setState({ selectedSubmissionCenter: event.key });
  };

  getDropdownMenu = () => {
    return (
      <Menu
        selectedKeys={[`${_.get(this.state, "selectedSubmissionCenter", "")}`]}
      >
        {_.map(this.state.submissionCenters, item => (
          <Menu.Item key={item.slug} onClick={this.onMenuClick}>
            {item.name}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  submit = () => {
    this.props.submit && this.props.submit(this.state.selectedSubmissionCenter);
  };

  render() {
    const { closeModal } = this.props;
    return (
      <Modal destroyOnClose visible={true} closable={false} footer={null}>
        <div
          className="licence-modal__header"
          style={{ marginBottom: "unset" }}
        >
          <Text
            type="extra_bold"
            size="16px"
            text={translate("label.menu.editproperties")}
          />
          <img
            src="/images/close.svg"
            className="licence-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <Text
          type="regular"
          size="14px"
          opacity={0.5}
          text={translate("text.dashboard.editproperties")}
        />
        <div className="global__center-vert" style={{ marginTop: "5%" }}>
          <Text
            type="bold"
            opacity={0.5}
            textStyle={{ marginRight: "4px" }}
            size="14px"
            text={`${translate("label.dashboard.submissioncenter")}:`}
          />
          <Dropdown
            overlay={this.getDropdownMenu}
            trigger={["click"]}
            className="global__center-vert global__cursor-pointer"
          >
            <Row
              style={{
                border: "solid 1px",
                minWidth: "30%",
                padding: "4px",
                justifyContent: "space-between",
                borderRadius: "4px"
              }}
            >
              <Text
                type="extra_bold"
                opacity={0.5}
                textStyle={{ marginRight: "4px" }}
                size="14px"
                text={
                  _.get(this.state, "selectedSubmissionCenter") ||
                  "Choose Submission Center"
                }
              />
              <Icon type="down" />
            </Row>
          </Dropdown>
        </div>
        <div style={{ marginTop: "40px", textAlign: "right" }}>
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            onClick={closeModal}
            buttonStyle={{ width: "120px", marginRight: "12px" }}
          />
          <OmniButton
            label={translate("label.button.update")}
            buttonStyle={{ width: "120px" }}
            onClick={this.submit}
          />
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    submissionCenters: state.Application.submissionCenters,
    selectedSubmission: state.Application.selectedSubmission
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
)(ApplicationProperties);
