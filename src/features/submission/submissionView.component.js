import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Icon, Tabs, Modal, Menu, Avatar } from "antd";
import _ from "lodash";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import TreeNode from "./treeNode.component";
import NodeProperties from "./nodeProperties.component";
import NodeSequences from "./nodeSequences.component";
import { SubmissionActions, UsermanagementActions } from "../../redux/actions";
import ValidationResults from "./validationResults.component";
import {
  Sidebar,
  Loader,
  Footer,
  DraggableModal,
  Text,
  OmniButton,
  Row
} from "../../uikit/components";
import {
  getSequenceJson,
  getLifeCycleJson,
  getSequences
} from "../../redux/selectors/submissionView.selector";
import ProfileMenu from "../header/profileMenu.component";
import SubmissionViewUsers from "./submissionViewUsers.component";
import { translate } from "../../translations/translator";

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
      parentHeaderHeight: 0,
      showUsersSection: false,
      selectedUser: null,
      showEditMessage: false
    };
    this.parentHeaderRef = React.createRef();
    this.treeContainerRef = React.createRef();
    this.treeRef = React.createRef();
    this.treeNodesMap = new Map();
  }

  componentDidMount() {
    const { selectedSubmission } = this.props;
    if (this.parentHeaderRef.current) {
      const parentHeaderHeight = this.parentHeaderRef.current.clientHeight + 28;
      this.setState({ parentHeaderHeight });
    }
    if (selectedSubmission) {
      this.props.actions.fetchSequences(selectedSubmission.id);
      this.props.actions.fetchLifeCycleJson(selectedSubmission);
    }
    this.fetchUsers();
  }

  toggle = callback => {
    this.clearTreeNodesMap();
    this.setState({ treeExpand: !this.state.treeExpand }, () => {
      if (typeof callback === "function") {
        callback();
      }
    });
  };

  onNodeSelected = (id, properties, leafParent, extraProperties) => {
    if (leafParent) {
      let lifeCycles = [];
      if (_.isArray(leafParent)) {
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
      properties.lifeCycles = lifeCycles;
    }
    if (this.props.selectedSequence) {
      properties.isSequence = true;
    }
    if (extraProperties) {
      properties = { ...properties, ...extraProperties };
    }
    this.setState({ selectedNodeId: id, nodeProperties: properties });
  };

  onSelectedSequence = sequence => {
    this.treeNodesMap.clear();
    this.props.actions.setSelectedSequence(sequence);
    this.props.actions.fetchSequenceJson(sequence);
    this.setState({
      treeExpand: false,
      selectedView: "",
      nodeProperties: null
    });
    this.closeValidationModal();
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
      if (this.props.selectedSequence) {
        return "Sequence Properties";
      }
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
    this.closeValidationModal();
  };

  onModeTabChange = mode => {
    this.clearTreeNodesMap();
    this.setState({ selectedMode: mode });
  };

  openApplicationsScreen = () => {
    this.props.actions.setSelectedSequence(null);
    window.close();
    this.props.history.push("/applications");
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

  validate = () => {
    if (this.state.openValidationModal) {
      return;
    }
    this.clearTreeNodesMap();
    this.setState({ openValidationModal: true });
  };

  clearTreeNodesMap = () => {
    this.treeNodesMap.clear();
  };

  closeValidationModal = () => {
    this.setState({ openValidationModal: false });
  };

  createKey = () => {
    const {
      selectedSequence,
      selectedSubmission,
      sequenceJson,
      lifeCycleJson
    } = this.props;
    const { selectedView, selectedMode } = this.state;
    let key = `${selectedView}_${selectedMode}_`;
    if (selectedSequence) {
      key = `${key}${_.get(selectedSequence, "json_path", "")}#${_.size(
        sequenceJson
      )}`;
    } else {
      key = `${key}${_.get(
        selectedSubmission,
        "life_cycle_json_path",
        ""
      )}#${_.size(lifeCycleJson)}`;
    }
    return key;
  };

  onSequenceSortByChanged = sortBy => {
    this.setState({ sequenceSortBy: sortBy });
  };

  fetchUsers = (filters = "") => {
    const { selectedCustomer } = this.props;
    selectedCustomer &&
      this.props.dispatch(
        UsermanagementActions.fetchUsers({
          customerId: selectedCustomer.id,
          ...filters
        })
      );
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
    const { selectedSequence, sequenceJson, lifeCycleJson } = this.props;
    if (selectedSequence) {
      return sequenceJson;
    }
    return lifeCycleJson;
  };

  onValidationResultItemClick = item => {
    // item.ID = "n03098";
    // item.name = "m5-3-2-3-reports-of-studies-using-other-human-biomaterials";
    // item.title = "5.3.2.3 Reports of Studies Using Other Human Biomaterials";
    if (!this.state.treeExpand) {
      this.toggle(() => setTimeout(() => this.selectChildNode(item), 2000));
      return;
    }
    this.selectChildNode(item);
  };

  selectChildNode = item => {
    if (!this.treeNodesMap.size) {
      this.searchNode(this.treeRef.current, item);
    }
    let selectedNode = null;
    if (item.ID) {
      selectedNode = this.treeNodesMap.get(item.ID);
    } else {
      selectedNode = this.treeNodesMap.get(`${item.name}_${item.title}`);
    }
    if (selectedNode) {
      selectedNode.selectNode();
      const elem = _.get(selectedNode, "nodeElementRef.current", null);
      elem &&
        elem.scrollIntoView({
          behavior: "smooth"
        });
    }
  };

  searchNode = (node, item) => {
    if (!node) {
      return;
    }
    const id = _.get(node, "state.properties.ID");
    if (id) {
      this.treeNodesMap.set(id, node);
    } else {
      const name = _.get(node, "state.properties.name", "");
      const title = _.get(node, "state.properties.title", "");
      this.treeNodesMap.set(`${name}_${title}`, node);
    }
    _.forEach(node.nodeRefs, nodeRef => {
      this.searchNode(_.get(nodeRef, "current"), item);
    });
  };

  openUsersSection = () => {
    this.setState({ showUsersSection: !this.state.showUsersSection });
  };

  setSelectedUser = user => {
    this.setState({ selectedUser: user, showEditMessage: true });
  };

  hideEditMessage = () => {
    this.setState({ showEditMessage: false });
  };

  render() {
    const {
      loading,
      sequences,
      selectedSequence,
      sequenceJson,
      lifeCycleJson,
      selectedSubmission,
      users
    } = this.props;
    const {
      selectedView,
      selectedMode,
      sequenceSortBy,
      showUsersSection,
      selectedUser,
      showEditMessage
    } = this.state;

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
                <div style={{ height: showUsersSection ? "45%" : "93%" }}>
                  <NodeSequences
                    submissionLabel={_.get(selectedSubmission, "name", "")}
                    selected={selectedSequence}
                    sequences={sequences}
                    onSelectedSequence={this.onSelectedSequence}
                    sortBy={sequenceSortBy}
                    onSortByChanged={this.onSequenceSortByChanged}
                  />
                </div>
                <div
                  className="panel-sequences__users global__cursor-pointer"
                  onClick={this.openUsersSection}
                >
                  <Text
                    type="bold"
                    opacity={0.7}
                    text={translate("label.dashboard.users")}
                  />
                  <Icon
                    type={showUsersSection ? "up" : "down"}
                    className="global__cursor-pointer"
                  />
                </div>
                {showUsersSection && (
                  <SubmissionViewUsers
                    searchUsers={this.fetchUsers}
                    users={users}
                    selectedUser={selectedUser}
                    onUserSelected={this.setSelectedUser}
                  />
                )}
              </div>
            </Sidebar>
            <div
              ref={this.treeContainerRef}
              className="panels__tree"
              style={{ width: `${this.state.treePanelWidth}%` }}
            >
              {showEditMessage && (
                <div className="panels__tree__editblock">
                  <Text
                    className="panels__tree__editblock-text"
                    type="medium"
                    size="12px"
                    text={translate("text.submission.editpermissions")}
                  />
                  <Text
                    className="panels__tree__editblock-text global__cursor-pointer"
                    onClick={this.hideEditMessage}
                    type="bold"
                    size="12px"
                    text={translate("label.generic.ok")}
                  />
                </div>
              )}
              <div className="panels__tree__permissions">
                <Row>
                  <Avatar
                    size="small"
                    icon="user"
                    size={35}
                    style={{ marginRight: "8px" }}
                  />
                  <Text
                    type="medium"
                    text="Editing Angela Walker’s permissions"
                  />
                </Row>
                <Row>
                  <OmniButton
                    type="secondary"
                    label={translate("label.button.cancel")}
                    buttonStyle={{ marginRight: "8px" }}
                  />
                  <OmniButton
                    type="primary"
                    label={translate("label.button.savechanges")}
                  />
                </Row>
              </div>
              <TreeNode
                ref={this.treeRef}
                key={this.createKey()}
                label={this.getTreeLabel()}
                content={this.getContent()}
                expand={this.state.treeExpand}
                onNodeSelected={this.onNodeSelected}
                selectedNodeId={this.state.selectedNodeId}
                mode={selectedMode}
                view={selectedView}
                submission={selectedSubmission}
                assignPermissions={selectedUser !== null}
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
                  view={selectedView}
                />
              </div>
            </Sidebar>
          </div>
          <DraggableModal
            visible={this.state.openValidationModal}
            draggableAreaClass=".validationResults__header"
          >
            <ValidationResults
              sequence={selectedSequence}
              label={_.get(selectedSubmission, "name", "")}
              onClose={this.closeValidationModal}
              onItemSelected={this.onValidationResultItemClick}
            />
          </DraggableModal>
        </div>
        {/*  <Modal
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
        </Modal> */}
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
    selectedSubmission: state.Application.selectedSubmission,
    selectedCustomer: state.Customer.selectedCustomer,
    users: state.Usermanagement.users
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators({ ...SubmissionActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionView);
