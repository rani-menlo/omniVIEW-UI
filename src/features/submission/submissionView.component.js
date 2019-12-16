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
import {
  SubmissionActions,
  UsermanagementActions,
  ApiActions
} from "../../redux/actions";
import ValidationResults from "./validationResults.component";
import {
  Sidebar,
  Loader,
  Footer,
  DraggableModal,
  Text,
  OmniButton,
  Row,
  AssignPermissionsModal,
  ImageLoader
} from "../../uikit/components";
import {
  getSequenceJson,
  getLifeCycleJson,
  getSequences
} from "../../redux/selectors/submissionView.selector";
import ProfileMenu from "../header/profileMenu.component";
import SubmissionViewUsers from "./submissionViewUsers.component";
import { translate } from "../../translations/translator";
import { CHECKBOX, ROLE_IDS } from "../../constants";
import { Permissions } from "./permissions";
import {
  isLoggedInAuthor,
  isLoggedInOmniciaAdmin,
  isLoggedInCustomerAdmin,
  isAdmin
} from "../../utils";
import usermanagementActions from "../../redux/actions/usermanagement.actions";
import FindNode from "./findNode.component";
import { UsermanagementApi } from "../../redux/api";

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
      openFindModal: false,
      parentHeaderHeight: 0,
      showUsersSection: false,
      selectedUser: null,
      showEditMessage: false,
      viewPermissions: false,
      editPermissions: false,
      sequences: [],
      showPermissionsModal: false,
      selectedNode: null,
      proUser: false,
      enableValidateSequence: false,
      fileLevelAccessObj: {
        label: "",
        fileIds: [],
        isFolder: false
      }
    };
    this.parentHeaderRef = React.createRef();
    this.treeContainerRef = React.createRef();
    this.treeRef = React.createRef();
    this.treeNodesMap = new Map();
  }

  async componentDidMount() {
    let state = {};
    if (this.parentHeaderRef.current) {
      state.parentHeaderHeight = this.parentHeaderRef.current.clientHeight + 38;
    }
    // if user is not admin, by default enable view permissions.
    if (
      !isLoggedInOmniciaAdmin(this.props.role) &&
      !isLoggedInCustomerAdmin(this.props.role)
    ) {
      state.viewPermissions = true;
    }
    let proUser = false;
    if (isLoggedInOmniciaAdmin(this.props.role)) {
      proUser = true;
    } else {
      const res = await UsermanagementApi.getLicenseInfo();
      _.forEach(res.data.data, subscription => {
        const hasPro = subscription.type_name.includes("Pro");
        if (hasPro) {
          proUser = hasPro;
          return false;
        }
      });
    }
    if (proUser) {
      state.proUser = proUser;
    }
    if (_.size(state)) {
      this.setState({ ...state });
    }
    this.initData();
  }

  componentWillUnmount() {
    this.props.dispatch(SubmissionActions.clearSearchResults());
  }

  static getDerivedStateFromProps(props, state) {
    if (props.sequences.length && !state.sequences.length) {
      return {
        sequences: SubmissionView.setDefaultPermissionsToSequences(
          props.sequences
        )
      };
    }
    return null;
  }

  static setDefaultPermissionsToSequences = sequences => {
    return _.map(sequences, sequence => {
      sequence.checkboxValue = sequence.hasAccess
        ? CHECKBOX.SELECTED
        : CHECKBOX.DESELECTED;
      if (_.size(sequence.childs)) {
        sequence.childs = SubmissionView.setDefaultPermissionsToSequences(
          sequence.childs
        );
      }
      return sequence;
    });
  };

  initData = () => {
    const { selectedSubmission, user } = this.props;
    if (selectedSubmission) {
      // fetch sequences first then lifecycle json
      this.props.dispatch(
        SubmissionActions.fetchSequencesWithPermissions(
          selectedSubmission.id,
          user,
          () => {
            this.props.dispatch(
              SubmissionActions.fetchLifeCycleJson(
                selectedSubmission,
                this.props.user
              )
            );
          }
        )
      );
    }
  };

  toggle = callback => {
    this.clearTreeNodesMap();
    this.setState({ treeExpand: !this.state.treeExpand }, () => {
      if (typeof callback === "function") {
        callback();
      }
    });
  };

  /* finding a new file in the array of files.
   looping the array recursively till we get the new file */
  getNewFileInLifeCycle = (array, modified) => {
    let leafID = modified.substring(
      modified.lastIndexOf("#") + 1,
      modified.length
    );
    const fileId = leafID || modified;
    const oldFile = _.find(array, { ID: fileId });
    const newModified = _.get(oldFile, "[modified-file]");
    if (!newModified) {
      return oldFile;
    }
    return this.getNewFileInLifeCycle(array, newModified);
  };

  onNodeSelected = (id, properties, leafParent, extraProperties, node) => {
    if (
      this.state.selectedNode &&
      this.state.selectedNode.state.nodeId !== id
    ) {
      this.state.selectedNode.hideDotsIcon();
      // this.state.selectedNode.fullyExpandFalse();
    }
    /* if (properties.lifeCycles) {
      const cycles = _.groupBy(properties.lifeCycles, "sequence");
      properties.lifeCycles = _.map(cycles, array => array[0]);
    }
    if (leafParent && !properties.lifeCycles) {
      let lifeCycles = [];
      if (_.isArray(leafParent) && leafParent.length > 1) {
        const newFile = this.getNewFileInLifeCycle(
          leafParent,
          _.get(properties, "ID")
        );
        if (newFile) {
          leafParent = _.sortBy(leafParent, leaf => {
            return leaf.ID === newFile.ID ? 0 : 1;
          });
        }
        let fileId = _.get(newFile, "ID", properties.ID);
        _.map(leafParent, leaf => {
          if (leaf.ID === fileId) {
            lifeCycles.push(leaf);
            return;
          }
          const modified = _.get(leaf, "[modified-file]", "");
          const leafID = modified.substring(
            modified.lastIndexOf("#") + 1,
            modified.length
          );
          if (leafID === fileId) {
            lifeCycles.push(leaf);
            fileId = leaf.ID;
          }
        });
      } else {
        if (_.isArray(leafParent)) {
          lifeCycles = lifeCycles.concat(leafParent);
        } else {
          lifeCycles.push(leafParent);
        }
      }
      properties.lifeCycles = lifeCycles;
    } */
    if (this.props.selectedSequence) {
      properties.isSequence = true;
    }
    if (extraProperties) {
      properties = { ...properties, ...extraProperties };
    }
    this.setState({
      selectedNodeId: id,
      nodeProperties: properties,
      selectedNode: node
    });
  };

  onCheckChange = node => {
    this.props.dispatch(ApiActions.requestOnDemand());
    const checkboxValue =
      node.state.checkboxValue === CHECKBOX.SELECTED
        ? CHECKBOX.DESELECTED
        : CHECKBOX.SELECTED;
    node.setCheckboxValue(checkboxValue);
    let content = node.props.content;
    content = _.get(content, "[ectd:ectd]", content);
    const bool = !content.hasAccess;
    this.setAccess(content, bool);
    this.modifyChildNodeAccess(node, bool);
    this.iterateNodeParent(node);
    this.props.dispatch(ApiActions.successOnDemand());
  };

  modifyChildNodeAccess = (node, bool) => {
    if (node.nodeRefs) {
      _.forEach(node.nodeRefs, nodeRef => {
        const currentNode = _.get(nodeRef, "current", null);
        if (currentNode) {
          this.setAccess(currentNode.props.content, bool);
          currentNode.setCheckboxValue(+bool);
          this.modifyChildNodeAccess(currentNode, bool);
        } else {
          this.modifyContentAccess(node, bool);
        }
      });
    } else {
      this.modifyContentAccess(node, bool);
    }
  };

  modifyContentAccess = (node, bool) => {
    node = _.get(node, "props.content") || node;
    _.map(node, val => {
      if (typeof val === "object") {
        this.setAccess(val, bool);
        this.modifyChildNodeAccess(val, bool);
      }
    });
  };

  setAccess = (obj, bool) => {
    if (_.get(obj, "is_x_ref", false)) {
      return;
    }
    const fileId = obj.fileID;
    obj.hasAccess = bool;
    if (bool === !!CHECKBOX.SELECTED) {
      fileId && Permissions.GRANTED.file_ids.add(fileId);
      fileId && Permissions.REVOKED.file_ids.delete(fileId);
    } else {
      fileId && Permissions.GRANTED.file_ids.delete(fileId);
      fileId && Permissions.REVOKED.file_ids.add(fileId);
    }
  };

  iterateNodeParent = node => {
    if (node && node.props.parentNode) {
      const { parentNode } = node.props;
      if (parentNode.current) {
        return;
      }
      const checkboxValue = +node.props.content.hasAccess;
      if (checkboxValue === CHECKBOX.DESELECTED) {
        const selected = _.find(
          _.get(parentNode, "nodeRefs", []),
          node => node.current.props.content.hasAccess === !!CHECKBOX.SELECTED
        );
        if (!selected) {
          parentNode.props.content.hasAccess = !!checkboxValue;
          parentNode.setCheckboxValue(checkboxValue);
        }
      } else {
        const content = _.get(
          parentNode.props.content,
          "[ectd:ectd]",
          parentNode.props.content
        );
        content.hasAccess = !!checkboxValue;
        parentNode.setCheckboxValue(checkboxValue);
      }
      this.iterateNodeParent(parentNode);
    }
  };

  onSequenceSelected = sequence => {
    Permissions.clear();
    this.treeNodesMap.clear();
    this.props.actions.setSelectedSequence(sequence);
    this.props.dispatch(
      SubmissionActions.fetchSequenceJson(
        sequence,
        this.state.selectedUser || this.props.user
      )
    );
    this.setState({
      treeExpand: false,
      selectedView: "",
      nodeProperties: null,
      enableValidateSequence: this.state.proUser
    });
    this.closeValidationModal();
  };

  onSelectedSequence = sequence => {
    this.props.dispatch(SubmissionActions.clearSearchResults());
    if (Permissions.hasChanges()) {
      this.showConfirmDialog(() => this.onSequenceSelected(sequence));
      return;
    }
    this.onSequenceSelected(sequence);
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
    } else if (
      _.get(nodeProperties, "version", "").includes("STF") ||
      _.get(nodeProperties, "STF")
    ) {
      if (_.get(nodeProperties, "[study-categories].length")) {
        return "Study Properties";
      }
      return "STF Properties";
    } else if (nodeProperties.fileID) {
      return "Document Properties";
    } else {
      return "Heading Properties";
    }
  };

  showConfirmDialog = callback => {
    Modal.confirm({
      className: "omnimodal",
      title: translate("text.submission.unsaved"),
      okText: translate("label.button.continue"),
      cancelText: translate("label.button.cancel"),
      onOk: callback
    });
  };

  changeView = view => {
    this.props.dispatch(SubmissionActions.clearSearchResults());
    Permissions.clear();
    const { selectedUser, nodeProperties } = this.state;
    const { selectedSubmission, user } = this.props;
    this.props.actions.setSelectedSequence(null);
    this.props.dispatch(
      SubmissionActions.fetchLifeCycleJson(
        selectedSubmission,
        selectedUser || user,
        () => {
          this.clearTreeNodesMap();
          nodeProperties && this.onValidationResultItemClick(nodeProperties);
        }
      )
    );
    this.closeValidationModal();
    const state = { selectedView: view };
    if (this.state.editPermissions && view === "current") {
      state.editPermissions = false;
      state.viewPermissions = true;
      state.showEditMessage = false;
    }
    this.setState(state);
  };

  onViewTabChange = view => {
    if (this.state.editPermissions && Permissions.hasChanges()) {
      this.showConfirmDialog(() => this.changeView(view));
      return;
    }
    this.changeView(view);
  };

  onModeTabChange = mode => {
    this.clearTreeNodesMap();
    this.setState({ selectedMode: mode });
  };

  openApplicationsScreen = () => {
    this.props.dispatch(SubmissionActions.resetFind());
    this.props.actions.setSelectedSequence(null);
    window.close();
    this.props.history.push("/applications");
  };

  getSubmissionLabel = () => {
    const { selectedSequence, sequenceJson, lifeCycleJson } = this.props;
    const jsonData = selectedSequence ? sequenceJson : lifeCycleJson;
    const label = _.get(
      jsonData,
      "[fda-regional:fda-regional][admin][application-set][application][application-information][application-number][$t]",
      ""
    );
    return label;
  };

  getSequenceLabel = () => {
    const { selectedSubmission, selectedSequence } = this.props;
    return `${_.get(selectedSubmission, "name", "")}\\${_.get(
      selectedSequence,
      "name",
      ""
    )} (${_.get(selectedSequence, "submission_type", "")}-${_.get(
      selectedSequence,
      "submission_sub_type",
      ""
    )})`;
  };

  getTreeLabel = () => {
    if (this.state.selectedView) {
      const selectedView =
        this.state.selectedView === "current"
          ? "[Current View]"
          : "[Life Cycle View]";
      let submissionCenter = _.get(
        this.props,
        "selectedSubmission.submission_center",
        ""
      );
      submissionCenter = submissionCenter ? `[${submissionCenter}]` : "";
      return `Submission ${this.getSubmissionLabel()} ${selectedView} ${submissionCenter}`;
    }
    return `Sequence ${this.getSequenceLabel()}`;
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
      lifeCycleJson,
      user
    } = this.props;
    const { selectedView, selectedMode } = this.state;

    /* let key = `${selectedView}_${selectedMode}_`;
    if (selectedSequence) {
      key = `${key}${_.get(selectedSequence, "json_path", "")}#${_.size(
        sequenceJson
      )}_${_.get(sequenceJson, "[ectd:ectd][hash]", false)}`;
    } else {
      key = `${key}${_.get(
        selectedSubmission,
        "life_cycle_json_path",
        ""
      )}#${_.size(lifeCycleJson)}_${_.get(
        lifeCycleJson,
        "[ectd:ectd][hash]",
        false
      )}`;
    } */

    return selectedSequence
      ? _.get(sequenceJson, "[ectd:ectd][hash]", false)
      : _.get(lifeCycleJson, "[ectd:ectd][hash]", false);
  };

  onSequenceSortByChanged = sortBy => {
    this.setState({ sequenceSortBy: sortBy });
  };

  fetchUsers = (filters = "") => {
    let roles = [];
    // adding ominicia roles as well
    if (filters.roles.length < 4) {
      _.map(filters.roles, role => {
        roles.push(role);
        roles.push(role - 3);
      });
    }

    filters.roles = roles;
    const { selectedCustomer, selectedSubmission } = this.props;
    selectedCustomer &&
      this.props.dispatch(
        UsermanagementActions.fetchUsers({
          customerId: selectedCustomer.id,
          submissionId: selectedSubmission.id,
          isOmnicia: true,
          ...filters
        })
      );
  };

  onSequenceCheckboxChange = checkedSequence => {
    const sequences = [...this.state.sequences];
    checkedSequence.checkboxValue =
      checkedSequence.checkboxValue === CHECKBOX.SELECTED
        ? CHECKBOX.DESELECTED
        : CHECKBOX.SELECTED;
    if (checkedSequence.checkboxValue === CHECKBOX.SELECTED) {
      if (checkedSequence.hasAccess) {
        Permissions.REVOKED.sequence_ids.delete(checkedSequence.id);
      } else {
        Permissions.GRANTED.sequence_ids.add(checkedSequence.id);
      }
    } else {
      if (!checkedSequence.hasAccess) {
        Permissions.GRANTED.sequence_ids.delete(checkedSequence.id);
      } else {
        Permissions.REVOKED.sequence_ids.add(checkedSequence.id);
      }
    }
    this.setState({ sequences });
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
    if (!this.state.treeExpand) {
      this.toggle(() => setTimeout(() => this.selectChildNode(item), 2000));
      return;
    }
    this.selectChildNode(item);
  };

  getNodeFromMap = item => {
    const label = `${_.get(item, "name", "")}_${_.get(item, "title", "")}`;
    let node = this.treeNodesMap.get(label) || this.treeNodesMap.get(item.ID);
    return node;
  };

  selectChildNode = item => {
    if (!this.treeNodesMap.size) {
      this.searchNode(this.treeRef.current, item);
    }
    if (_.get(item, "ID") === "m1") {
      item = { ID: "m1-regional_US Regional" };
    }
    let selectedNode = null;
    if (_.get(item, "dtd-version")) {
      selectedNode = this.treeNodesMap()
        .values()
        .next().value;
    } else {
      selectedNode = this.getNodeFromMap(item);
    }

    // this case
    if (!selectedNode) {
      let files = _.get(item, "lifeCycles");
      _.forEach(files, file => {
        selectedNode = this.getNodeFromMap(file);
        if (selectedNode) {
          return false;
        }
      });
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
    if (id === "n03262") {
      console.log(node);
    }
    if (id) {
      const existingNode = this.treeNodesMap.get(id);
      if (existingNode && _.get(node, "state.properties.STF")) {
        const name = _.get(node, "state.properties.name", "");
        const title = _.get(node, "state.properties.title", "");
        this.treeNodesMap.set(`${name}_${title}`, node);
      } else {
        this.treeNodesMap.set(id, node);
      }
    } else if (_.get(node, "[state][properties][dtd-version]")) {
      const label = this.getSequenceLabel();
      this.treeNodesMap.set(`${label}_${label}`, node);
    } else {
      const name = _.get(node, "state.properties.name", "");
      const title = _.get(node, "state.properties.title", "");
      this.treeNodesMap.set(`${name}_${title}`, node);
    }
    _.forEach(node.nodeRefs, nodeRef => {
      this.searchNode(_.get(nodeRef, "current"), item);
    });
  };

  selectInLifeCycle = () => {
    this.clearTreeNodesMap();
    this.changeView("lifeCycle");
  };

  openUsersSection = () => {
    this.setState({ showUsersSection: !this.state.showUsersSection });
  };

  viewPermissions = (user = this.state.selectedUser) => {
    const { selectedSubmission } = this.props;
    Permissions.clear();
    if (selectedSubmission) {
      this.props.dispatch(
        SubmissionActions.resetSequences(selectedSubmission.id)
      );
      this.setState({ sequences: [] });
      this.props.dispatch(
        SubmissionActions.fetchSequencesWithPermissions(
          selectedSubmission.id,
          user,
          () => {
            if (this.props.selectedSequence) {
              this.props.dispatch(
                SubmissionActions.fetchSequenceJson(
                  this.props.selectedSequence,
                  user
                )
              );
            } else {
              this.props.dispatch(
                SubmissionActions.fetchLifeCycleJson(selectedSubmission, user)
              );
            }
          }
        )
      );
    }
    this.setState({
      selectedUser: user,
      viewPermissions: true,
      showEditMessage: false,
      editPermissions: false
    });
  };

  hidePermissions = () => {
    this.setState({
      selectedUser: null,
      viewPermissions: false
    });
    this.initData();
  };

  enableEditingPermissions = () => {
    this.setState({
      viewPermissions: false,
      showEditMessage: true,
      editPermissions: true
    });
  };

  disableEditingPermissions = () => {
    Permissions.clear();
    this.setState({
      selectedUser: null,
      showEditMessage: false,
      editPermissions: false
    });
    this.initData();
  };

  hideEditMessage = () => {
    this.setState({ showEditMessage: false });
  };

  save = () => {
    if (
      Permissions.GRANTED.sequence_ids.size ||
      Permissions.REVOKED.sequence_ids.size
    ) {
      this.props.dispatch(
        SubmissionActions.assignSequencePermissions(
          {
            user_ids: [this.state.selectedUser.user_id],
            granted_sequence_ids: [...Permissions.GRANTED.sequence_ids],
            revoked_sequence_ids: [...Permissions.REVOKED.sequence_ids]
          },
          () => {
            if (
              Permissions.GRANTED.file_ids.size ||
              Permissions.REVOKED.file_ids.size
            ) {
              this.props.dispatch(
                SubmissionActions.assignFilePermissions(
                  {
                    user_ids: [this.state.selectedUser.user_id],
                    granted_file_ids: [...Permissions.GRANTED.file_ids],
                    revoked_file_ids: [...Permissions.REVOKED.file_ids]
                  },
                  this.viewPermissions
                )
              );
              this.props.dispatch(ApiActions.requestOnDemand());
            } else {
              this.viewPermissions();
            }
          }
        )
      );
    } else if (
      Permissions.GRANTED.file_ids.size ||
      Permissions.REVOKED.file_ids.size
    ) {
      this.props.dispatch(
        SubmissionActions.assignFilePermissions(
          {
            user_ids: [this.state.selectedUser.user_id],
            granted_file_ids: [...Permissions.GRANTED.file_ids],
            revoked_file_ids: [...Permissions.REVOKED.file_ids]
          },
          this.viewPermissions
        )
      );
    }
  };

  saveEditedPermissions = () => {
    if (
      (Permissions.GRANTED.sequence_ids.size ||
        Permissions.REVOKED.sequence_ids.size) &&
      (Permissions.GRANTED.file_ids.size || Permissions.REVOKED.file_ids.size)
    ) {
      Modal.confirm({
        title: translate("text.generic.areyousure"),
        content: translate("text.submission.permissionsoverride"),
        okText: translate("label.button.continue"),
        cancelText: translate("label.button.cancel"),
        onOk: this.save
      });
      return;
    }
    this.save();
  };

  openPermissionsModal = (properties, isFolder, fileIds) => {
    this.props.dispatch(usermanagementActions.resetUsersOfFileOrSubmission());
    this.setState({
      showPermissionsModal: true,
      fileLevelAccessObj: {
        label: properties.hash
          ? `Submission ${this.getSubmissionLabel()}`
          : properties.title,
        isFolder,
        fileIds
      }
    });
  };

  closePermissionsModal = () => {
    if (this.state.selectedUser) {
      this.viewPermissions();
    }
    this.setState({ showPermissionsModal: false });
  };

  getFormFile = () => {
    const { selectedSequence, sequenceJson, lifeCycleJson } = this.props;
    let formFile = [];
    const json = selectedSequence ? sequenceJson : lifeCycleJson;
    const m1Regional = _.get(
      json,
      "[ectd:ectd][m1-administrative-information-and-prescribing-information][m1-regional]"
    );
    _.forEach(m1Regional, (val, key) => {
      if (_.includes(key, "submission-information")) {
        formFile.push(_.get(val, "Form FDA 1571.leaf[0]", null));
        formFile.push(_.get(val, "Form FDA 356h.leaf[0]", null));
        return false;
      }
    });
    return _.filter(formFile);
  };

  onFullyExpand = () => {
    this.toggle();
  };

  openFindModal = () => {
    this.setState({ openFindModal: true });
  };

  closeFindModal = () => {
    this.setState({ openFindModal: false });
  };

  getFilteredUsers = () => {
    const { administrator, publisher, author } = ROLE_IDS.OMNICIA;
    const filteredUsers = _.filter(this.props.users, user => {
      if (
        user.role_id === administrator ||
        user.role_id === publisher ||
        user.role_id === author
      ) {
        if (!user.hasAccess) {
          console.log(user);
        }
        return user.hasAccess;
      }
      return true;
    });
    return filteredUsers;
  };

  render() {
    const {
      loading,
      selectedSequence,
      sequenceJson,
      lifeCycleJson,
      selectedCustomer,
      selectedSubmission,
      users,
      role
    } = this.props;
    const {
      sequences,
      selectedView,
      selectedMode,
      sequenceSortBy,
      showUsersSection,
      selectedUser,
      showEditMessage,
      viewPermissions,
      editPermissions,
      showPermissionsModal,
      fileLevelAccessObj,
      enableValidateSequence
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
                <span className="text">
                  {`${translate("label.dashboard.dashboard")} | ${
                    selectedCustomer.company_name
                  }`}
                </span>
              </div>
              <div className="submissionview__profilebar__title">
                <img
                  src="/images/omniview-cloud.svg"
                  style={{ height: "25px", width: "106px" }}
                />
              </div>
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
              <FlexBox onClick={this.openFindModal}>
                <Icon type="search" className="global__icon" />
                <span className="icon-label">Find</span>
              </FlexBox>
              <div
                className={`submissionview__header__validate icon_text_border ${enableValidateSequence &&
                  "global__cursor-pointer"}`}
                style={{
                  ...(!enableValidateSequence && { border: 0 })
                }}
                onClick={enableValidateSequence && this.validate}
              >
                <img
                  src="/images/folder-validate.svg"
                  className="global__icon"
                  style={{
                    marginLeft: 0,
                    opacity: !enableValidateSequence ? 0.2 : 1
                  }}
                />
                <span
                  className="text"
                  style={!enableValidateSequence ? { opacity: 0.2 } : {}}
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
                <div
                  style={{
                    height: showUsersSection
                      ? "45%"
                      : isAdmin(role.name)
                      ? "calc(100% - 33px)"
                      : "100%"
                  }}
                >
                  <NodeSequences
                    onSequenceCheckboxChange={this.onSequenceCheckboxChange}
                    submissionLabel={_.get(selectedSubmission, "name", "")}
                    selected={_.get(selectedSequence, "id", 0)}
                    sequences={sequences}
                    onSelectedSequence={this.onSelectedSequence}
                    sortBy={sequenceSortBy}
                    onSortByChanged={this.onSequenceSortByChanged}
                    viewPermissions={viewPermissions}
                    editPermissions={editPermissions}
                  />
                </div>
                {isAdmin(role.name) && (
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
                )}
                {showUsersSection && (
                  <SubmissionViewUsers
                    role={role}
                    searchUsers={this.fetchUsers}
                    users={this.getFilteredUsers()}
                    selectedUser={selectedUser}
                    onUserSelected={this.viewPermissions}
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
                  {/* <Text
                    className="panels__tree__editblock-text global__cursor-pointer"
                    onClick={this.hideEditMessage}
                    type="bold"
                    size="12px"
                    text={translate("label.generic.ok")}
                  /> */}
                </div>
              )}

              {viewPermissions &&
                (isLoggedInOmniciaAdmin(role) ||
                  isLoggedInCustomerAdmin(role)) && (
                  <div className="panels__tree__permissions">
                    <Row>
                      <ImageLoader
                        path={_.get(this.state.selectedUser, "profile")}
                        width="35px"
                        height="35px"
                        type="circle"
                        style={{ marginRight: "8px" }}
                        globalAccess={_.get(
                          this.state.selectedUser,
                          "has_global_access"
                        )}
                      />
                      <Text
                        type="medium"
                        text={`${translate("text.generic.viewingpermissions", {
                          user: `${_.get(
                            this.state.selectedUser,
                            "first_name",
                            ""
                          )} ${_.get(this.state.selectedUser, "last_name", "")}`
                        })} ${
                          selectedView === "current"
                            ? translate("text.generic.editlifecycle")
                            : ""
                        }`}
                      />
                    </Row>
                    <Row>
                      <OmniButton
                        type="secondary"
                        label={translate("label.button.close")}
                        buttonStyle={{ marginRight: "8px" }}
                        onClick={this.hidePermissions}
                      />
                      {(selectedView === "lifeCycle" ||
                        selectedSequence !== null) && (
                        <OmniButton
                          type={
                            !isAdmin(
                              _.get(this.state, "selectedUser.role_name")
                            ) &&
                            _.get(this.state, "selectedUser.has_global_access")
                              ? "danger"
                              : "primary"
                          }
                          disabled={isAdmin(
                            _.get(this.state, "selectedUser.role_name")
                          )}
                          label={
                            !isAdmin(
                              _.get(this.state, "selectedUser.role_name")
                            ) &&
                            _.get(this.state, "selectedUser.has_global_access")
                              ? translate("label.button.editpermissionsglobal")
                              : translate("label.button.editpermissions")
                          }
                          buttonStyle={{ borderColor: "transparent" }}
                          onClick={this.enableEditingPermissions}
                        />
                      )}
                    </Row>
                  </div>
                )}

              {editPermissions && (
                <div className="panels__tree__permissions">
                  <Row>
                    <ImageLoader
                      path={_.get(this.state.selectedUser, "profile")}
                      width="35px"
                      height="35px"
                      type="circle"
                      style={{ marginRight: "8px" }}
                      globalAccess={_.get(
                        this.state.selectedUser,
                        "has_global_access"
                      )}
                    />
                    <Text
                      type="medium"
                      text={translate("text.generic.editingpermissions", {
                        user: `${_.get(
                          this.state.selectedUser,
                          "first_name",
                          ""
                        )} ${_.get(this.state.selectedUser, "last_name", "")}`
                      })}
                    />
                  </Row>
                  <Row>
                    <OmniButton
                      type="secondary"
                      label={translate("label.button.cancel")}
                      buttonStyle={{ marginRight: "8px" }}
                      onClick={this.disableEditingPermissions}
                    />
                    <OmniButton
                      // disabled={!Permissions.hasChanges()}
                      type="primary"
                      label={translate("label.button.savechanges")}
                      onClick={this.saveEditedPermissions}
                    />
                  </Row>
                </div>
              )}
              <div
                className="panels__tree__structure"
                style={{
                  height: showEditMessage
                    ? "83%"
                    : isAdmin(_.get(this.state, "selectedUser.role_name")) &&
                      (viewPermissions || editPermissions)
                    ? "90%"
                    : "100%"
                }}
              >
                <TreeNode
                  ref={this.treeRef}
                  parentNode={this.treeRef}
                  role={role}
                  key={this.createKey()}
                  label={this.getTreeLabel()}
                  content={this.getContent()}
                  expand={this.state.treeExpand}
                  fullyExpanded={this.onFullyExpand}
                  onNodeSelected={this.onNodeSelected}
                  selectedNodeId={this.state.selectedNodeId}
                  mode={selectedMode}
                  view={selectedView}
                  submission={selectedSubmission}
                  viewPermissions={viewPermissions}
                  editPermissions={editPermissions}
                  onCheckChange={this.onCheckChange}
                  onExpandNode={this.onExpandNode}
                  openPermissionsModal={this.openPermissionsModal}
                  selectInLifeCycle={this.selectInLifeCycle}
                  defaultExpand
                />
              </div>
            </div>
            <Sidebar
              containerStyle={{ width: "30%", height: "100%" }}
              direction="rtl"
              expand={this.state.propertiesExpand}
            >
              <div className="panel panel-properties">
                <NodeProperties
                  properties={this.state.nodeProperties}
                  formFile={this.getFormFile()}
                  m1Json={
                    selectedSequence
                      ? _.get(sequenceJson, "[fda-regional:fda-regional]", "")
                      : _.get(lifeCycleJson, "[fda-regional:fda-regional]", "")
                  }
                  projectJson={
                    selectedSequence
                      ? _.get(sequenceJson, "[project]", "")
                      : _.get(lifeCycleJson, "[project]", "")
                  }
                  sequence={selectedSequence || _.get(sequences, "[0]", "")}
                  submission={selectedSubmission}
                  view={selectedView}
                  mode={selectedMode}
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
          <DraggableModal
            minWidth="35%"
            minHeight="30%"
            visible={this.state.openFindModal}
            draggableAreaClass=".validationResults__header"
          >
            <FindNode
              onClose={this.closeFindModal}
              onItemSelected={this.onValidationResultItemClick}
            />
          </DraggableModal>
        </div>
        {showPermissionsModal && (
          <AssignPermissionsModal
            visible={showPermissionsModal}
            closeModal={this.closePermissionsModal}
            fileLevelAccessObj={fileLevelAccessObj}
          />
        )}
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
    user: state.Login.user,
    "omniview-pro": state.Login["omniview-pro"],
    role: state.Login.role,
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

export default connect(mapStateToProps, mapDispatchToProps)(SubmissionView);
