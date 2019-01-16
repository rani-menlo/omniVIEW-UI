import React, { Component } from "react";
import { Icon, Tabs, Modal } from "antd";
import _ from "lodash";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import TreeNode from "./treeNode.component";
import NodeProperties from "./nodeProperties.component";
import NodeSequences from "./nodeSequences.component";
import Sidebar from "../../uikit/components/sidebar/sidebar.component";
import LeftArrowHide from "../../../public/images/left-arrow-hide.svg";
import RightArrowHide from "../../../public/images/right-arrow-hide.svg";
import ValidateIcon from "../../../public/images/folder-validate.svg";
import ListIcon from "../../../public/images/list.svg";
import OpenFolderIcon from "../../../public/images/open-folder.svg";
import { SubmissionActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import Header from "../header.component";
import ValidationResults from "./validationResults.component";

const TabPane = Tabs.TabPane;

class SubmissionView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeExpand: false,
      propertiesExpand: true,
      sequencesExpand: true,
      selectedNodeId: "",
      selectedView: "lifeCycle",
      selectedMode: "qc",
      nodeProperties: {},
      treePanelWidth: 50,
      openValidationModal: false
    };
  }

  componentDidMount() {
    const { selectedSubmission } = this.props;
    if (selectedSubmission) {
      this.props.actions.fetchSequences(selectedSubmission.id);
      this.props.actions.fetchLifeCycleJson(selectedSubmission);
    }
  }

  toggle = () => {
    this.setState({ treeExpand: !this.state.treeExpand });
  };

  onNodeSelected = (id, properties) => {
    this.setState({ selectedNodeId: id, nodeProperties: properties });
  };

  onSelectedSequence = sequence => {
    this.setState({ treeExpand: false, selectedView: "current" }, () => {
      this.props.actions.setSelectedSequence(sequence);
      this.props.actions.fetchSequenceJson(sequence);
    });
  };

  togglePropertiesPane = () => {
    const propertiesExpand = !this.state.propertiesExpand;
    const treePanelWidth = propertiesExpand
      ? this.state.treePanelWidth - 30
      : this.state.treePanelWidth + 30;
    this.setState({
      propertiesExpand,
      treePanelWidth
    });
  };

  toggleSequencesPane = () => {
    const sequencesExpand = !this.state.sequencesExpand;
    const treePanelWidth = sequencesExpand
      ? this.state.treePanelWidth - 20
      : this.state.treePanelWidth + 20;
    this.setState({
      sequencesExpand,
      treePanelWidth
    });
  };

  getPropertiesPaneTitle = () => {
    const { nodeProperties } = this.state;
    if (!_.size(nodeProperties)) {
      return "Properties";
    } else if (!nodeProperties.title) {
      return "Heading Properties";
    } else {
      return "Document Properties";
    }
  };

  onViewTabChange = view => {
    this.setState({ selectedView: view });
    if (view === "lifeCycle") {
      const { selectedSubmission } = this.props;
      this.props.actions.setSelectedSequence(null);
      this.props.actions.fetchLifeCycleJson(selectedSubmission);
    } else {
      this.onSelectedSequence(this.props.sequences[0]);
    }
  };

  onModeTabChange = mode => {
    this.setState({ selectedMode: mode });
  };

  validate = () => {
    this.setState({ openValidationModal: true });
  };

  closeValidationModal = () => {
    this.setState({ openValidationModal: false });
  };

  render() {
    const {
      loading,
      sequences,
      selectedSequence,
      jsonData,
      selectedSubmission
    } = this.props;
    const { selectedView, selectedMode } = this.state;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <div className="submissionview">
          <div className="submissionview__profilebar">
            <div className="submissionview__profilebar__section">
              <Icon type="left" />
              <span className="text">Dashboard</span>
            </div>
            <div className="submissionview__profilebar__title">omniVIEW</div>
            <div className="submissionview__profilebar__section">
              <span className="text">John Smith</span>
              <Icon type="down" />
            </div>
          </div>
          <div className="submissionview__header">
            <div className="icon_text_border">
              <img
                src={OpenFolderIcon}
                className="global__icon"
                style={{ marginLeft: "0px" }}
              />
              <span className="text">Open</span>
            </div>
            {/* <Icon type="close-circle" theme="filled" className="global__icon" /> */}
            {/* <Icon type="interation" theme="filled" className="global__icon" /> */}
            {/* <Icon
            type="left-circle"
            theme="filled"
            className="global__icon"
            style={{ marginLeft: "2%" }}
          />
          <Icon type="right-circle" theme="filled" className="global__icon" /> */}
            <div className="submissionview__header__mode">
              {/* <Icon type="hdd" theme="filled" className="global__icon" />
            <span className="mode-text">Mode:</span> */}
              <div className="submissionview__header__mode__tabs">
                <Tabs
                  defaultActiveKey={selectedMode}
                  onChange={this.onModeTabChange}
                >
                  <TabPane tab="Standard" key="standard" />
                  <TabPane tab="QC" key="qc" />
                </Tabs>
              </div>
            </div>
            <div className="submissionview__header__view" key={selectedView}>
              {/* <Icon type="eye" theme="filled" className="global__icon" />
            <span className="view-text">View:</span> */}
              <div className="submissionview__header__view__tabs">
                <Tabs
                  defaultActiveKey={selectedView}
                  onChange={this.onViewTabChange}
                >
                  <TabPane tab="Current" disabled key="current" />
                  <TabPane tab="Life Cycle" key="lifeCycle" />
                </Tabs>
              </div>
            </div>
            <FlexBox onClick={this.toggle}>
              <Icon
                type={this.state.treeExpand ? "minus" : "plus"}
                className="global__icon"
              />
              <span className="icon-label">
                {this.state.treeExpand ? "Collapse All" : "Expand All"}
              </span>
            </FlexBox>
            <FlexBox>
              <Icon type="search" className="global__icon" />
              <span className="icon-label">Find</span>
            </FlexBox>
            <div
              className="submissionview__header__validate icon_text_border"
              onClick={this.validate}
            >
              <img
                src={ValidateIcon}
                className="global__icon"
                style={{ marginLeft: "0px" }}
              />
              <span className="text">Validate Sequence</span>
            </div>
            <FlexBox>
              <img src={ListIcon} className="global__icon" />
              <span className="icon-label">Show Amendment List</span>
            </FlexBox>
          </div>
          <div className="submissionview__siders">
            <div className="submissionview__siders__sequence">
              <img
                className="global__cursor-pointer"
                src={
                  this.state.sequencesExpand ? LeftArrowHide : RightArrowHide
                }
                onClick={this.toggleSequencesPane}
              />
              <span style={{ marginLeft: "8px" }}>Sequences</span>
            </div>
            <div className="submissionview__siders__tree" />
            <div
              className={`submissionview__siders__properties ${!this.state
                .propertiesExpand && "align-right"}`}
            >
              <span style={{ marginRight: "8px" }}>
                {this.getPropertiesPaneTitle()}
              </span>
              <img
                className="global__cursor-pointer"
                src={
                  this.state.propertiesExpand ? RightArrowHide : LeftArrowHide
                }
                onClick={this.togglePropertiesPane}
              />
            </div>
          </div>
          <div className="submissionview__panels">
            <Sidebar
              containerStyle={{ width: "20%" }}
              direction="ltr"
              expand={this.state.sequencesExpand}
            >
              <div className="panel panel-sequences">
                <NodeSequences
                  selected={selectedSequence}
                  sequences={sequences}
                  onSelectedSequence={this.onSelectedSequence}
                />
              </div>
            </Sidebar>
            <div
              className="panels__tree"
              style={{ width: `${this.state.treePanelWidth}%` }}
            >
              <TreeNode
                key={_.get(jsonData, "ectd:ectd.sequence", "") + selectedMode}
                label={_.get(selectedSequence, "name", "")}
                content={jsonData}
                expand={this.state.treeExpand}
                onNodeSelected={this.onNodeSelected}
                selectedNodeId={this.state.selectedNodeId}
                mode={this.state.selectedMode}
              />
            </div>
            <Sidebar
              containerStyle={{ width: "30%" }}
              direction="rtl"
              expand={this.state.propertiesExpand}
            >
              <div className="panel panel-properties">
                <NodeProperties properties={this.state.nodeProperties} />
              </div>
            </Sidebar>
          </div>
        </div>
        <Modal
          visible={this.state.openValidationModal}
          closable={false}
          footer={null}
          destroyOnClose
          wrapClassName="validationResults__dialog"
        >
          <ValidationResults
            sequenceId={
              _.get(selectedSequence, "id", "") ||
              _.get(selectedSubmission, "id", "")
            }
            label={
              _.get(selectedSequence, "name", "") ||
              _.get(selectedSubmission, "name", "")
            }
            onClose={this.closeValidationModal}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

const FlexBox = styled.div`
  display: flex;
  cursor: default;
`;

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    sequences: state.Submission.sequences,
    selectedSequence: state.Submission.selectedSequence,
    jsonData: state.Submission.jsonData,
    selectedSubmission: state.Application.selectedSubmission
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...SubmissionActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionView);
