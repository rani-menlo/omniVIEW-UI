import React, { Component } from "react";
import { Icon, Tabs, Modal, Avatar } from "antd";
import _ from "lodash";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import TreeNode from "./treeNode.component";
import NodeProperties from "./nodeProperties.component";
import NodeSequences from "./nodeSequences.component";
import Sidebar from "../../uikit/components/sidebar/sidebar.component";
import { SubmissionActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import ValidationResults from "./validationResults.component";
import Footer from "../../uikit/components/footer/footer.component";

const TabPane = Tabs.TabPane;

class SubmissionView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeExpand: false,
      propertiesExpand: true,
      sequencesExpand: true,
      selectedNodeId: "",
      selectedView: "current",
      selectedMode: "standard",
      nodeProperties: null,
      treePanelWidth: 50,
      openValidationModal: false,
      parentHeaderHeight: 0
    };
    this.parentHeaderRef = React.createRef();
  }

  componentDidMount() {
    const { selectedSubmission } = this.props;
    const parentHeaderHeight =
      this.parentHeaderRef.current.clientHeight + 4 + 28;
    this.setState({ parentHeaderHeight });
    if (selectedSubmission) {
      this.props.actions.fetchSequences(selectedSubmission.id);
      this.props.actions.fetchLifeCycleJson(selectedSubmission);
    }
  }

  toggle = () => {
    this.setState({ treeExpand: !this.state.treeExpand });
  };

  onNodeSelected = (id, properties, leafParent) => {
    if (leafParent) {
      let lifeCycles = [];
      if (_.isArray(leafParent)) {
        lifeCycles = _.filter(
          leafParent,
          leaf => leaf.title === properties.title
        );
      } else {
        lifeCycles.push(leafParent);
      }
      properties.lifeCycles = lifeCycles;
    }
    this.setState({ selectedNodeId: id, nodeProperties: properties });
  };

  onSelectedSequence = sequence => {
    this.setState(
      { treeExpand: false, selectedView: "", nodeProperties: null },
      () => {
        this.props.actions.setSelectedSequence(sequence);
        this.props.actions.fetchSequenceJson(sequence);
      }
    );
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
    } else if (nodeProperties["dtd-version"]) {
      return "Submission Properties";
    } else if (nodeProperties.name === "m1-regional") {
      return "M1 Regional Properties";
    } else if (nodeProperties.fileID) {
      return "Document Properties";
    } else {
      return "Heading Properties";
    }
  };

  onViewTabChange = view => {
    this.setState({ selectedView: view });
    this.props.actions.setSelectedSequence(null);
    if (view === "lifeCycle") {
      const { selectedSubmission } = this.props;
      this.props.actions.fetchLifeCycleJson(selectedSubmission);
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

  openApplicationsScreen = () => {
    this.props.history.goBack();
  };

  getTreeLabel = jsonData => {
    const { selectedSubmission, selectedSequence } = this.props;
    const label = _.get(jsonData, "ectd:ectd.label", "");
    if (this.state.selectedView) {
      const selectedView =
        this.state.selectedView === "current"
          ? "[Current View]"
          : "[Life Cycle View]";
      return `Submission ${label} ${selectedView}`;
    } else {
      return `Sequence ${_.get(selectedSubmission, "name", "")}\\${_.get(
        selectedSequence,
        "name",
        ""
      )}`;
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
    const key =
      _.get(jsonData, "ectd:ectd.sequence", "") + selectedMode + selectedView;
    console.log("key:", key);
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <div className="submissionview">
          <div ref={this.parentHeaderRef}>
            <div className="submissionview__profilebar">
              <div
                className="submissionview__profilebar__section"
                onClick={this.openApplicationsScreen}
              >
                <Icon type="left" />
                <span className="text">Dashboard</span>
              </div>
              <div className="submissionview__profilebar__title">omniVIEW</div>
              <div className="submissionview__profilebar__section">
                <Avatar
                  size="small"
                  icon="user"
                  style={{ width: "20px", height: "20px" }}
                />
                <span className="submissionview__profilebar__section-username">
                  John Smith
                </span>
                <Icon type="down" />
              </div>
            </div>
            <div className="submissionview__header">
              <div className="icon_text_border">
                <img
                  src="/images/open-folder.svg"
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
                    activeKey={selectedView}
                    onChange={this.onViewTabChange}
                  >
                    <TabPane tab="Current" key="current" />
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
                className={`submissionview__header__validate icon_text_border ${selectedSequence &&
                  "global__cursor-pointer"}`}
                style={!selectedSequence ? { border: 0 } : {}}
                onClick={selectedSequence && this.validate}
              >
                <img
                  src="/images/folder-validate.svg"
                  className="global__icon"
                  style={{
                    marginLeft: "0px",
                    opacity: !selectedSequence ? 0.2 : 1
                  }}
                />
                <span
                  className="text"
                  style={!selectedSequence ? { opacity: 0.2 } : {}}
                >
                  Validate Sequence
                </span>
              </div>
              <FlexBox>
                <img src="/images/list.svg" className="global__icon" />
                <span className="icon-label">Show Amendment List</span>
              </FlexBox>
            </div>
            <div className="submissionview__siders">
              <div className="submissionview__siders__sequence">
                <img
                  className="global__cursor-pointer"
                  src={
                    this.state.sequencesExpand
                      ? "/images/left-arrow-hide.svg"
                      : "/images/right-arrow-hide.svg"
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
                    this.state.propertiesExpand
                      ? "/images/right-arrow-hide.svg"
                      : "/images/left-arrow-hide.svg"
                  }
                  onClick={this.togglePropertiesPane}
                />
              </div>
            </div>
          </div>
          <div
            className="submissionview__panels"
            style={{
              height: `calc(100% - ${this.state.parentHeaderHeight}px)`
            }}
          >
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
                key={
                  _.get(jsonData, "ectd:ectd.sequence", "") +
                  selectedMode +
                  selectedView
                }
                label={this.getTreeLabel(jsonData)}
                content={jsonData}
                expand={this.state.treeExpand}
                onNodeSelected={this.onNodeSelected}
                selectedNodeId={this.state.selectedNodeId}
                mode={selectedMode}
                view={selectedView}
                defaultExpand
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
            sequence={selectedSequence}
            label={_.get(selectedSubmission, "name", "")}
            onClose={this.closeValidationModal}
          />
        </Modal>
        <Footer alignToBottom />
      </React.Fragment>
    );
  }
}

const FlexBox = styled.div`
  display: flex;
  cursor: pointer;
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
