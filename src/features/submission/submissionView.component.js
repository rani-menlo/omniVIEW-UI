import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Icon, Tabs, Modal, Menu } from "antd";
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
import {
  getSequenceJson,
  getLifeCycleJson,
  getSequences
} from "../../redux/selectors/submissionView.selector";
import ProfileMenu from "../header/profileMenu.component";

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
      sequenceSortBy: "submission",
      nodeProperties: null,
      treePanelWidth: 50,
      openValidationModal: false,
      parentHeaderHeight: 0
    };
    this.parentHeaderRef = React.createRef();
  }

  componentDidMount() {
    const { selectedSubmission } = this.props;
    if (this.parentHeaderRef.current) {
      const parentHeaderHeight =
        this.parentHeaderRef.current.clientHeight + 4 + 28;
      this.setState({ parentHeaderHeight });
    }
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
        /* let propertyId = properties.ID;
        _.map(leafParent, leaf => {
          if (leaf.ID === propertyId) {
            lifeCycles.push(leaf);
            return;
          }
          const modified = _.get(leaf, "[modified-file]", "");
          if (modified) {
            const hashId = modified.substring(
              modified.lastIndexOf("#") + 1,
              modified.length
            );
            if (propertyId === hashId) {
              lifeCycles.push(leaf);
              propertyId = leaf.ID;
            }
          }
        }); */

        const href = properties["xlink:href"];
        const fileName = href.substring(href.lastIndexOf("/") + 1, href.length);
        lifeCycles = _.filter(leafParent, leaf => {
          const name = leaf["xlink:href"].substring(
            leaf["xlink:href"].lastIndexOf("/") + 1,
            leaf["xlink:href"].length
          );
          return name === fileName;
        });
        const deletedLeafs = _.filter(
          leafParent,
          leaf => leaf.operation === "delete"
        );
        _.forEach(deletedLeafs, deletedLeaf => {
          const modified = _.get(deletedLeaf, "[modified-file]", "");
          const hashId = modified.substring(
            modified.lastIndexOf("#") + 1,
            modified.length
          );
          const leaf = _.find(lifeCycles, life => life.ID === hashId);
          if (leaf) {
            lifeCycles.push(deletedLeaf);
            return false;
          }
        });
      } else {
        lifeCycles.push(leafParent);
      }

      /* if (properties.operation === "new") {
        lifeCycles = _.filter(
          lifeCycles,
          leaf => leaf.operation === "new" || leaf.operation === "replace"
        );
      } else if (properties.operation === "replace") {
        lifeCycles = _.filter(
          lifeCycles,
          leaf =>
            leaf.operation === "new" ||
            leaf.operation === "replace" ||
            leaf.operation === "append"
        );
      } */
      properties.lifeCycles = lifeCycles;
    }
    this.setState({ selectedNodeId: id, nodeProperties: properties });
  };

  onSelectedSequence = sequence => {
    this.props.actions.setSelectedSequence(sequence);
    this.props.actions.fetchSequenceJson(sequence);
    this.setState({
      treeExpand: false,
      selectedView: "",
      nodeProperties: null
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
    } else if (nodeProperties["dtd-version"]) {
      return "Submission Properties";
    } else if (nodeProperties.name === "m1-regional") {
      return "M1 Regional Properties";
    } else if (_.get(nodeProperties, "version", "").includes("STF")) {
      return "STF Properties";
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
    this.props.actions.setSelectedSequence(null);
    this.props.history.goBack();
  };

  getTreeLabel = () => {
    const {
      selectedSubmission,
      selectedSequence,
      sequenceJson,
      lifeCycleJson
    } = this.props;
    const jsonData = selectedSequence ? sequenceJson : lifeCycleJson;
    const label = _.get(
      jsonData,
      "[fda-regional:fda-regional][admin][application-set][application][application-information][application-number][$t]",
      ""
    );
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
      )} (${_.get(selectedSequence, "submission_type", "")}-${_.get(
        selectedSequence,
        "submission_sub_type",
        ""
      )})`;
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

  createKey = () => {
    const { sequenceJson, lifeCycleJson, selectedSequence } = this.props;
    const { selectedView, selectedMode } = this.state;
    let key = `${selectedView}_${selectedMode}_`;
    if (selectedSequence) {
      key = key + _.get(sequenceJson, "ectd:ectd.sequence", "");
    } else {
      key = key + _.get(lifeCycleJson, "ectd:ectd.sequence", "");
    }
    return key;
  };

  onSequenceSortByChanged = sortBy => {
    this.setState({ sequenceSortBy: sortBy });
  };

  getMenu = () => {
    return (
      <Menu>
        <Menu.Item>
          <span>Edit Profile</span>
        </Menu.Item>
        <Menu.Item>
          <span>Sign Out</span>
        </Menu.Item>
      </Menu>
    );
  };

  getContent = () => {
    const {selectedSequence, sequenceJson, lifeCycleJson} = this.props;
    if(selectedSequence) {
      console.log("sequenceJson", sequenceJson);
      return sequenceJson;
    }
    console.log("lifeCycleJson", lifeCycleJson);
    return lifeCycleJson;
  }

  render() {
    const {
      loading,
      sequences,
      selectedSequence,
      sequenceJson,
      lifeCycleJson,
      selectedSubmission
    } = this.props;
    const { selectedView, selectedMode, sequenceSortBy } = this.state;

    if (!selectedSubmission) {
      return <Redirect to="/applications" />;
    }

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
                <ProfileMenu />
              </div>
            </div>
            <div className="submissionview__header">
              <div
                className="icon_text_border"
                style={{ border: 0, cursor: "not-allowed" }}
              >
                <img
                  src="/images/open-folder.svg"
                  className="global__icon"
                  style={{ opacity: 0.2 }}
                />
                <span className="text" style={{ opacity: 0.2 }}>
                  Open
                </span>
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
              <FlexBox style={{ opacity: 0.2, cursor: "not-allowed" }}>
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
                    marginLeft: 0,
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
              <FlexBox style={{ cursor: "not-allowed" }}>
                <img
                  src="/images/list.svg"
                  className="global__icon"
                  style={{
                    opacity: 0.2
                  }}
                />
                <span
                  className="icon-label"
                  style={{
                    opacity: 0.2
                  }}
                >
                  Show Amendment List
                </span>
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
              containerStyle={{ width: "20%", height: "100%" }}
              direction="ltr"
              expand={this.state.sequencesExpand}
            >
              <div className="panel panel-sequences">
                <NodeSequences
                  submissionLabel={_.get(selectedSubmission, "name", "")}
                  selected={selectedSequence}
                  sequences={sequences}
                  onSelectedSequence={this.onSelectedSequence}
                  sortBy={sequenceSortBy}
                  onSortByChanged={this.onSequenceSortByChanged}
                />
              </div>
            </Sidebar>
            <div
              className="panels__tree"
              style={{ width: `${this.state.treePanelWidth}%` }}
            >
              <TreeNode
                key={this.createKey()}
                label={this.getTreeLabel()}
                content={this.getContent()}
                expand={this.state.treeExpand}
                onNodeSelected={this.onNodeSelected}
                selectedNodeId={this.state.selectedNodeId}
                mode={selectedMode}
                view={selectedView}
                defaultExpand
              />
            </div>
            <Sidebar
              containerStyle={{ width: "30%", height: "100%" }}
              direction="rtl"
              expand={this.state.propertiesExpand}
            >
              <div className="panel panel-properties">
                <NodeProperties
                  properties={this.state.nodeProperties}
                  m1Json={
                    selectedSequence
                      ? _.get(sequenceJson, "[fda-regional:fda-regional]", "")
                      : _.get(lifeCycleJson, "[fda-regional:fda-regional]", "")
                  }
                  sequence={selectedSequence || _.get(sequences, "[0]", "")}
                  submission={selectedSubmission}
                />
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
    sequences: getSequences(state),
    selectedSequence: state.Submission.selectedSequence,
    lifeCycleJson: getLifeCycleJson(state),
    sequenceJson: getSequenceJson(state),
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
