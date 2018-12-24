import React, { Component } from "react";
import { Icon, Tabs } from "antd";
import _ from "lodash";
import styled from "styled-components";
import TreeNode from "./treeNode.component";
import { sampleData } from "./sample";
import NodeProperties from "./nodeProperties.component";
import NodeSequences from "./nodeSequences.component";
import Sidebar from "../../uikit/components/sidebar/sidebar.component";
import LeftArrowHide from "../../../assets/images/left-arrow-hide.svg";
import RightArrowHide from "../../../assets/images/right-arrow-hide.svg";
import ValidateIcon from "../../../assets/images/folder-validate.svg";
import ListIcon from "../../../assets/images/list.svg";
import OpenFolderIcon from "../../../assets/images/open-folder.svg";

const TabPane = Tabs.TabPane;

class SubmissionView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeExpand: false,
      selectedNodeId: "",
      nodeProperties: {},
      sequences: [],
      currentSequence: null,
      propertiesExpand: true,
      sequencesExpand: true,
      treePanelWidth: 50
    };
  }

  componentDidMount() {
    const sequences = _.keys(sampleData);
    this.setState({ sequences, currentSequence: sequences[0] });
  }

  toggle = () => {
    this.setState({ treeExpand: !this.state.treeExpand });
  };

  onNodeSelected = (id, properties) => {
    this.setState({ selectedNodeId: id, nodeProperties: properties });
  };

  onSelectedSequence = sequence => {
    this.setState({ currentSequence: sequence, treeExpand: false });
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

  render() {
    return (
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
              <Tabs defaultActiveKey="1">
                <TabPane tab="Standard" key="1" />
                {/* <TabPane tab="Qc" key="2" /> */}
              </Tabs>
            </div>
          </div>
          <div className="submissionview__header__view">
            {/* <Icon type="eye" theme="filled" className="global__icon" />
            <span className="view-text">View:</span> */}
            <div className="submissionview__header__view__tabs">
              <Tabs defaultActiveKey="1">
                <TabPane tab="Current" key="1" />
                <TabPane tab="Life Cycle" key="2" />
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
          <div className="submissionview__header__validate icon_text_border">
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
              src={this.state.sequencesExpand ? LeftArrowHide : RightArrowHide}
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
              src={this.state.propertiesExpand ? RightArrowHide : LeftArrowHide}
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
                sequences={this.state.sequences}
                onSelectedSequence={this.onSelectedSequence}
              />
            </div>
          </Sidebar>
          <div
            className="panels__tree"
            style={{ width: `${this.state.treePanelWidth}%` }}
          >
            <TreeNode
              key={this.state.currentSequence}
              label={this.state.currentSequence}
              content={sampleData[this.state.currentSequence]}
              expand={this.state.treeExpand}
              onNodeSelected={this.onNodeSelected}
              selectedNodeId={this.state.selectedNodeId}
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
    );
  }
}

const FlexBox = styled.div`
  display: flex;
  cursor: default;
`;

export default SubmissionView;
