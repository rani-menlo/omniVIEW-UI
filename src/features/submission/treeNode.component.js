import React, { Component } from "react";
import { Icon, Dropdown, Menu } from "antd";
import PropTypes from "prop-types";
import _ from "lodash";
import uuidv4 from "uuid/v4";
import { PermissionCheckbox, Text } from "../../uikit/components";
import {
  CHECKBOX,
  VALID_VALUES_XML_DATA_BOTTOM_LIST,
  VALID_VALUES_XML_DATA_TOP_LIST,
  VALID_VALUES_XML_DATA
} from "../../constants";
import { isLoggedInCustomerAdmin, isLoggedInOmniciaAdmin } from "../../utils";
import { translate } from "../../translations/translator";

class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeId: uuidv4(),
      properties: {},
      nodes: [],
      expand: this.props.defaultExpand || this.props.expand,
      fullyExpand: false,
      prevProps: this.props,
      checkboxValue: CHECKBOX.RESET_DEFAULT,
      showDotsIcon: false
    };
    this.nodeRefs = [];
    this.nodeElementRef = React.createRef();
    this._fileIds = null;
  }

  static propTypes = {
    content: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    submission: PropTypes.object,
    label: PropTypes.string.isRequired,
    paddingLeft: PropTypes.number,
    defaultPaddingLeft: PropTypes.number,
    expand: PropTypes.bool,
    selectedNodeId: PropTypes.string,
    onNodeSelected: PropTypes.func,
    selectInLifeCycle: PropTypes.func,
    mode: PropTypes.oneOf(["standard", "qc"]),
    view: PropTypes.oneOf(["current", "lifeCycle"]),
    defaultExpand: PropTypes.bool,
    fullyExpanded: PropTypes.func,
    leafParent: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    viewPermissions: PropTypes.bool,
    editPermissions: PropTypes.bool,
    openPermissionsModal: PropTypes.func,
    propsCheckboxValue: PropTypes.number
  };

  static defaultProps = {
    paddingLeft: 0, // px
    defaultPaddingLeft: 31, // px
    expand: false,
    defaultExpand: false,
    viewPermissions: false,
    editPermissions: false
  };

  static getDerivedStateFromProps(props, state) {
    const newState = { fullyExpand: state.fullyExpand };
    if (props.expand !== state.prevProps.expand) {
      newState.expand = props.expand;
      newState.fullyExpand = false;
    }
    return _.size(newState) ? { ...newState, prevProps: props } : null;
  }

  componentDidMount() {
    let { content, view, mode } = this.props;
    const properties = {};
    let nodes = [];
    // get object from the ectd:ectd
    content = _.get(content, "ectd:ectd", content);
    // checking if the content has stf folders, bcoz based on mode need to do some operations
    let stfFolders = this.getStfFoldersIfExist(content);
    if (stfFolders.length) {
      if (mode === "standard") {
        const omitKeys = _.map(stfFolders, "_omitKey");
        // In this mode, all stf folders are consolidated into one based on title
        // consolidated folder may have subfolders which inturn has leaf array
        // leaf array items are based on selected view i.e. in current view only latest
        // files are shown and in lifecycle view all files are shown.
        const consolidatedFolder = this.getConsolidatedStfFolders(stfFolders);
        // remove the keys from the main object
        if (omitKeys.length) {
          content = _.omit(content, omitKeys);
        }
        // set consolidatedFolder object properties to main object.
        _.map(consolidatedFolder, (value, key) => {
          content[key] = value;
        });
      } else {
        if (view === "current") {
          const omitKeys = _.map(stfFolders, "_omitKey");
          // removing subfolder leaf and appending to parent folder(stfFolder) as leaf
          stfFolders = _.map(stfFolders, stfFolder => {
            const keys = [];
            let leaf = [];
            const studyCategories = {};
            _.map(stfFolder, (value, key) => {
              if (typeof value === "object") {
                keys.push(key);
                if (key === "study-categories") {
                  studyCategories[stfFolder.sequence] = value;
                }
                if (value.leaf) {
                  const newLeafs = _.map(value.leaf, lf => ({
                    ...lf,
                    ...(_.has(value, "file-tag") && {
                      "file-tag": value["file-tag"]
                    }),
                    ...(_.has(value, "site-identifier") && {
                      "site-identifier": value["site-identifier"]
                    })
                  }));
                  leaf = [...leaf, ...newLeafs];
                }
              }
            });
            leaf = _.sortBy(leaf, "ID");
            stfFolder = _.omit(stfFolder, keys);
            stfFolder.leaf = leaf;
            stfFolder["study-categories"] = studyCategories;

            return stfFolder;
            // return this.removeSubfoldersAndAppendLeafToParent(stfFolder);
          });
          // grouping stf based on title
          const stfFoldersByTitle = _.groupBy(stfFolders, "title");
          // all leaf items of each stfFolder is combined and then modifying the
          // stfFolders array based on latest files.
          _.map(stfFoldersByTitle, array => {
            let foldrs = [];
            _.map(array, item => {
              foldrs = [...foldrs, ...item.leaf];
            });
            // foldrs are iterated to get an array which has only latest files.
            foldrs = this.setLatestFiles(foldrs);
            // after the array(foldrs) has latest files, then group it by sequence.
            const latestSequences = _.keys(_.groupBy(foldrs, "sequence"));
            // group old array(array) by seqence to get difference
            const allSequences = _.keys(_.groupBy(array, "sequence"));
            const diff = _.difference(allSequences, latestSequences);
            // remove diff items from stfFolders
            _.map(diff, df => {
              _.remove(stfFolders, { sequence: df });
            });
          });
          content = _.omit(content, omitKeys);
          // set the stfFolder to main object.
          _.map(stfFolders, stfFolder => {
            content[stfFolder["_omitKey"]] = stfFolder;
          });
        }
      }
    }

    if ((view === "" || view === "lifeCycle") && mode === "qc") {
      const version = _.get(content, "version", "");
      if (version && version.includes("STF")) {
        const keys = [];
        let leaf = [];
        // removing subfolder leaf and appending to parent folder(value) as leaf
        _.map(content, (value, key) => {
          if (typeof value === "object") {
            keys.push(key);
            if (value.leaf) {
              leaf = [...leaf, ...value.leaf];
            }
          }
        });
        leaf = _.sortBy(leaf, "ID");
        content = _.omit(content, keys);
        content.leaf = leaf;
        // this.removeSubfoldersAndAppendLeafToParent(content);
      }
    }
    _.map(content, (value, key) => {
      if (
        typeof value === "string" ||
        typeof value === "boolean" ||
        key === "study-categories" ||
        key === "lifeCycles"
      ) {
        properties[key] = value;
      } else {
        const node = { label: key, value };
        if (_.isArray(value) && key === "leaf") {
          this.setCurrentView(value);
          _.map(value, val => {
            // this.setCurrentView(val, value);
            if (view === "current" && !val.showInCurrentView) {
              return;
            }
            const newNode = { label: "leaf", value: val, leafParent: value };
            nodes.push(newNode);
          });
        } else if (
          _.get(value, "version", "").includes("STF") ||
          _.get(value, "STF", false)
        ) {
          const groups = _.groupBy(content, val => {
            return val.title;
          });
          node.leafParent = groups[value.title];
          nodes.push(node);
        } else {
          if (key === "leaf") {
            node.leafParent = value;
          }
          nodes.push(node);
        }
      }
    });

    // making STF nodes to come in top
    const leafNodes = _.filter(nodes, { label: "leaf" });
    const stfNodes = _.difference(nodes, leafNodes);
    nodes = [].concat(stfNodes).concat(leafNodes);

    if (properties["_stfKey"] && mode === "standard") {
      nodes = this.sortByTitle(nodes);
    }
    this.setState({
      properties,
      nodes,
      checkboxValue: properties.hasAccess
        ? CHECKBOX.SELECTED
        : CHECKBOX.DESELECTED
    });
    this.nodeRefs = _.map(nodes, node => React.createRef());
  }

  removeSubfoldersAndAppendLeafToParent = folder => {
    const keys = [];
    let leaf = [];
    _.map(folder, (value, key) => {
      if (typeof value === "object") {
        keys.push(key);
        if (value.leaf) {
          leaf = [...leaf, ...value.leaf];
        }
      }
    });
    folder = _.omit(folder, keys);
    folder.leaf = leaf;
    return folder;
  };

  sortByTitle = nodes => {
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base"
    });
    const nodesByTitle = _.groupBy(nodes, node => node.value.title);
    let titles = _.map(nodes, node => node.value.title);
    const bottomList = [],
      topList = [];
    titles = titles.sort(collator.compare);
    // ordering based on valid-values.xml data (Refer comment in VALID_VALUES_XML_DATA_BOTTOM_LIST)
    _.map(VALID_VALUES_XML_DATA.BOTTOM_LIST, item => {
      const idx = _.findIndex(titles, title => {
        const flag = title.includes(item);
        flag && bottomList.push(title);
        return flag;
      });
      idx >= 0 && titles.splice(idx, 1);
    });

    _.map(VALID_VALUES_XML_DATA.TOP_LIST, item => {
      const idx = _.findIndex(titles, title => {
        const flag = title.includes(item);
        flag && topList.push(title);
        return flag;
      });
      idx >= 0 && titles.splice(idx, 1);
    });

    titles = [...topList, ...titles, ...bottomList];
    return _.map(titles, title => nodesByTitle[title][0]);
  };

  getStfFoldersIfExist = rootFolder => {
    const stfFolders = [];
    _.map(rootFolder, (value, key) => {
      const version = _.get(value, "version", "");
      if (typeof value === "object" && version.includes("STF")) {
        const k = key.substring(0, key.lastIndexOf("[")) || key;
        stfFolders.push({ ..._.cloneDeep(value), _stfKey: k, _omitKey: key });
      }
    });
    return stfFolders;
  };

  getConsolidatedStfFolders = stfFolders => {
    const { view } = this.props;
    const groupedFldrs = _.groupBy(stfFolders, "_stfKey");
    const consolidatedFolder = {};
    _.map(groupedFldrs, (array, key) => {
      const subFoldr = {
        // lifeCycles: []
      };
      _.map(array, (item, idx) => {
        // subFoldr.lifeCycles.push(item);
        if (idx === 0) {
          subFoldr.hasAccess = subFoldr.hasAccess || item.hasAccess;
        }
        // subFoldr.hasAccess = subFoldr.hasAccess || item.hasAccess;
        _.map(item, (v, k) => {
          if (typeof v === "object") {
            if (v.leaf) {
              v.leaf = _.map(v.leaf, lf => ({
                ...lf,
                ...(_.has(v, "file-tag") && { "file-tag": v["file-tag"] }),
                ...(_.has(v, "site-identifier") && {
                  "site-identifier": v["site-identifier"]
                })
              }));
              // subFoldr.lifeCycles = subFoldr.lifeCycles.concat(v.leaf);
              v.lifeCycles = item.lifeCycles;
            }
            if (_.get(subFoldr, "[k].leaf")) {
              let leaf = [...subFoldr[k].leaf, ...v.leaf];
              if (view === "current") {
                leaf = this.setLatestFiles(leaf);
              }
              subFoldr[k].leaf = leaf;
            } else {
              if (!_.isArray(v)) {
                v["sequence"] = item["sequence"];
                v["operation"] = item["operation"];
                v["ID"] = item["ID"];
                v["fileID"] = item["fileID"];
                v["xlink:href"] = item["xlink:href"];
                v["STF"] = true;
                v["study-id"] = item["study-id"];
                v["study-title"] = item["study-title"];
                if (v["study-categories"]) {
                  v["study-categories"][item.sequence] =
                    item["study-categories"];
                } else {
                  v["study-categories"] = {
                    [item.sequence]: item["study-categories"]
                  };
                }
              }
              if (_.isArray(v) && k === "study-categories") {
                subFoldr[k] = subFoldr[k] || {};
                subFoldr[k][item.sequence] = (
                  subFoldr[k][item.sequence] || []
                ).concat(v);
              } else {
                let leaf = [];
                if (subFoldr[k]) {
                  leaf = subFoldr[k].leaf;
                }
                subFoldr[k] = v;
                let leafs = [];
                if (leaf) {
                  leafs = [...leaf];
                }
                if (subFoldr[k].leaf) {
                  leafs = [...leafs, ...subFoldr[k].leaf];
                }
                subFoldr[k].leaf = leafs;
              }
            }

            if (k !== "study-categories") {
              subFoldr[k].hasAccess = subFoldr[k].hasAccess || v.hasAccess;
            }
          } else {
            if (idx === 0) {
              subFoldr[k] = v;
            }
            // subFoldr[k] = v;
          }
        });
      });
      _.map(subFoldr, (val, key) => {
        if (
          typeof val === "object" &&
          key !== "lifeCycles" &&
          key !== "study-categories"
        ) {
          // val["lifeCycles"] = subFoldr["lifeCycles"];
          val["study-categories"] = subFoldr["study-categories"];
        }
      });
      consolidatedFolder[key] = subFoldr;
    });
    return consolidatedFolder;
  };

  setLatestFiles = array => {
    if (!_.isArray(array)) {
      return;
    }
    const newArray = [...array];
    _.map(array, item => {
      if (!item) {
        return;
      }
      let itemId = item.ID;
      _.map(array, leaf => {
        if (!leaf || leaf.ID === itemId) {
          return;
        }
        let modifiedFile = leaf["modified-file"];
        modifiedFile =
          modifiedFile &&
          modifiedFile.substring(modifiedFile.lastIndexOf("#") + 1);
        if (modifiedFile === itemId) {
          _.remove(newArray, { ID: itemId });
        }
      });
    });
    return newArray;
  };

  setCurrentView = array => {
    // get the latest files based on modified-file property
    let files = this.setLatestFiles(array);
    // get all deleted files
    const deletedFiles = _.filter(files, { operation: "delete" });
    // make all files visible except deleted files
    files = _.difference(files, deletedFiles);
    files = _.map(files, file => {
      file.showInCurrentView = true;
      return file;
    });
    // from the deleted files get the latest update of the file through
    // modified-file property and make it visible
    _.map(deletedFiles, deletedFile => {
      deletedFile.showInCurrentView = false;
      let modifiedFile = deletedFile["modified-file"];
      if (modifiedFile) {
        modifiedFile = modifiedFile.substring(
          modifiedFile.lastIndexOf("#") + 1
        );
        let file = _.find(array, { ID: modifiedFile });
        if (file) {
          modifiedFile = file["modified-file"];
          if (modifiedFile) {
            modifiedFile = modifiedFile.substring(
              modifiedFile.lastIndexOf("#") + 1
            );
            file = _.find(array, { ID: modifiedFile });
            file.showInCurrentView = true;
          } else {
            file.showInCurrentView = true;
          }
        }
      }
    });
  };

  getCaretIcon = () => {
    const { label } = this.props;
    if (label === "leaf") {
      return null;
    }
    return this.state.expand ? (
      <Icon type="caret-down" onClick={this.toggle} className="global__caret" />
    ) : (
      <Icon
        type="caret-right"
        onClick={this.toggle}
        className="global__caret"
      />
    );
  };

  getLeafIcon = () => {
    let icon = (
      <Icon type="folder" theme="filled" className="global__file-folder" />
    );
    const { properties } = this.state;
    const style = { width: "18px", height: "21px" };
    const version = _.get(properties, "version", "");
    const stfKey = _.get(properties, "_stfKey", "");
    if (properties.title === "US Regional") {
      icon = (
        <img
          src="/images/folder-us.svg"
          className="global__file-folder"
          style={style}
        />
      );
    }
    if (version.includes("STF") || stfKey) {
      icon = (
        <img
          src="/images/file-stf.svg"
          className="global__file-folder"
          style={style}
        />
      );
    }
    if (this.props.label === "leaf") {
      if (properties.is_x_ref) {
        icon = (
          <img
            src="/images/file-cross-ref.svg"
            className="global__file-folder"
            style={style}
          />
        );
      } else if (properties.operation === "new") {
        icon = (
          <img
            src="/images/file-new.svg"
            className="global__file-folder"
            style={style}
          />
        );
      } else if (properties.operation === "append") {
        icon = (
          <img
            src="/images/file-append.svg"
            className="global__file-folder"
            style={style}
          />
        );
      } else if (properties.operation === "replace") {
        icon = (
          <img
            src="/images/file-replace.svg"
            className="global__file-folder"
            style={style}
          />
        );
      } else {
        icon = (
          <img
            src="/images/file-delete.svg"
            className="global__file-folder"
            style={style}
          />
        );
      }
    }
    return icon;
  };

  selectNode = () => {
    const { onNodeSelected, leafParent, label } = this.props;
    let extraProperties = null;
    if (label.includes("FDA")) {
      extraProperties = {
        title: "form",
        name: "form",
        formType: label
      };
    }
    onNodeSelected &&
      onNodeSelected(
        this.state.nodeId,
        this.state.properties,
        leafParent,
        extraProperties,
        this
      );
  };

  deSelectNode = () => {
    this.setState({ selected: false });
  };

  hideDotsIcon = () => {
    this.setState({ showDotsIcon: false });
  };

  getLabel = () => {
    const { label, view, mode, submission } = this.props;
    const { properties } = this.state;
    let name = label;
    if (label === "leaf" || mode === "standard") {
      name = _.get(properties, "title", label);
      if (label === "leaf" && view) {
        name = `${name} [${_.get(submission, "name", "")}\\${
          properties.sequence
        }]`;
      }
    }

    return name;
  };

  openFile = () => {
    const { properties } = this.state;
    if (
      this.props.editPermissions ||
      (!isLoggedInCustomerAdmin(this.props.role) &&
        !isLoggedInOmniciaAdmin(this.props.role) &&
        !properties.hasAccess)
    ) {
      return;
    }

    if (_.get(properties, "operation", "") === "delete") {
      return;
    }
    const fileHref = properties["xlink:href"];
    let type = "";
    if (fileHref) {
      type = fileHref.substring(fileHref.lastIndexOf(".") + 1);
    }
    let newWindow = null;
    if (type.includes("pdf") && properties.fileID) {
      newWindow = window.open(
        `${process.env.PUBLIC_URL}/viewer/pdf/${properties.fileID}`,
        "_blank"
      );
    } else {
      if (properties.fileID) {
        newWindow = window.open(
          `${process.env.PUBLIC_URL}/viewer/${type}/${properties.fileID}`,
          "_blank"
        );
      }
    }

    if (newWindow) {
      newWindow.addEventListener("load", function() {
        newWindow.document.title = _.get(properties, "title", "");
      });
    }
  };

  toggle = () => {
    if (this.state.expand) {
      this.collapse();
    } else {
      this.expand();
      /* if (this.props.editPermissions) {
        this.props.onExpandNode && this.props.onExpandNode(this);
      } */
    }
  };

  expand = () => {
    !this.state.expand && this.setState({ expand: true });
  };

  collapse = () => {
    this.state.expand && this.setState({ expand: false });
  };

  fullyExpand = () => {
    const hash = _.get(this.state, "properties.hash");
    hash
      ? this.props.fullyExpanded()
      : this.setState({ fullyExpand: true, expand: true });
  };

  setCheckboxValue = checkboxValue => {
    this.setState({
      checkboxValue
    });
  };

  onCheckboxChange = e => {
    this.props.onCheckChange && this.props.onCheckChange(this);
  };

  onMouseEnter = () => {
    this.setState({
      showDotsIcon: true
    });
  };

  onMouseLeave = () => {
    if (this.props.selectedNodeId === this.state.nodeId) {
      return;
    }
    this.setState({
      showDotsIcon: false
    });
  };

  getMenu = () => {
    const style = {
      marginRight: "5px"
    };
    return (
      <Menu>
        {this.state.nodes.length && (
          <Menu.Item onClick={this.fullyExpand}>
            <div className="global__center-vert">
              <img src="/images/plus-black.svg" style={style} />
              <Text
                type="regular"
                size="12px"
                text={translate("label.node.fullyexpand")}
              />
            </div>
          </Menu.Item>
        )}
        {this.props.view !== "lifeCycle" && (
          <Menu.Item onClick={this.props.selectInLifeCycle}>
            <div className="global__center-vert">
              <img src="/images/life-cycle.svg" style={style} />
              <Text
                type="regular"
                size="12px"
                text={translate("label.node.selectinlifecycle")}
              />
            </div>
          </Menu.Item>
        )}
        {(isLoggedInOmniciaAdmin(this.props.role) ||
          isLoggedInCustomerAdmin(this.props.role)) &&
          !this.props.editPermissions && (
            <Menu.Item
              style={{ borderTop: "1px solid rgba(74, 74, 74, 0.25)" }}
              onClick={this.openPermissionsModal}
              disabled={this.state.properties.is_x_ref}
            >
              <div className="global__center-vert">
                <img src="/images/assign.svg" style={style} />
                <Text
                  type="regular"
                  size="12px"
                  text={translate("label.node.assignuseraccess")}
                />
              </div>
            </Menu.Item>
          )}
      </Menu>
    );
  };

  openPermissionsModal = () => {
    const { properties, nodes } = this.state;
    this._fileIds = new Set();
    if (properties.fileID && !properties.is_x_ref) {
      this._fileIds.add(properties.fileID);
    }
    _.map(nodes, node => {
      this.iterateFileIds(node.value);
    });
    const isFolder = properties.fileID ? false : true;
    this.props.openPermissionsModal(
      properties,
      isFolder,
      Array.from(this._fileIds)
    );
  };

  iterateFileIds = obj => {
    _.map(obj, (val, key) => {
      if (key === "fileID" && !obj.is_x_ref) {
        this._fileIds.add(val);
      } else if (key === "leaf") {
        const filesNoXref = _.filter(val, { is_x_ref: false });
        const filesNoXrefIds = _.map(filesNoXref, "fileID");
        _.map(filesNoXrefIds, id => {
          this._fileIds.add(id);
        });
      } else {
        typeof val === "object" &&
          key !== "lifeCycles" &&
          key !== "study-categories" &&
          this.iterateFileIds(val);
      }
    });
  };

  render() {
    const {
      nodes,
      expand,
      checkboxValue,
      showDotsIcon,
      fullyExpand,
      properties
    } = this.state;
    const {
      defaultPaddingLeft,
      selectedNodeId,
      onNodeSelected,
      mode,
      view,
      submission,
      viewPermissions,
      editPermissions,
      onCheckChange,
      onExpandNode,
      role,
      openPermissionsModal,
      selectInLifeCycle
    } = this.props;
    const paddingLeft = this.props.paddingLeft + defaultPaddingLeft;
    return (
      <React.Fragment>
        <div
          id={properties.ID}
          ref={this.nodeElementRef}
          className={`node ${selectedNodeId === this.state.nodeId &&
            "global__node-selected"}`}
          style={{
            display: "flex",
            opacity:
              viewPermissions || editPermissions
                ? checkboxValue === CHECKBOX.DESELECTED
                  ? 0.3
                  : 1
                : 1
          }}
          title={this.getLabel()}
          onClick={this.selectNode}
          onDoubleClick={this.openFile}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          {editPermissions && (
            <PermissionCheckbox
              style={{ marginLeft: "10px" }}
              value={checkboxValue}
              onChange={this.onCheckboxChange}
              disabled={properties.is_x_ref}
            />
          )}
          <div
            style={{ paddingLeft, width: "100%" }}
            className="global__center-vert"
          >
            {this.getCaretIcon()}
            {this.getLeafIcon()}
            <span className="global__node-text" style={{ overflow: "hidden" }}>
              {this.getLabel()}
            </span>
            {showDotsIcon && (
              <Dropdown overlay={this.getMenu} trigger={["click"]}>
                <img
                  src="/images/overflow-on.svg"
                  className="global__cursor-pointer"
                  style={{ marginLeft: "auto", marginRight: "8px" }}
                />
              </Dropdown>
            )}
          </div>
        </div>
        {expand &&
          _.map(nodes, (node, idx) => (
            <TreeNode
              ref={this.nodeRefs[idx]}
              parentNode={this}
              role={role}
              expand={this.props.expand || fullyExpand}
              paddingLeft={paddingLeft}
              key={node.label + idx + mode}
              label={node.label}
              content={node.value}
              selectedNodeId={selectedNodeId}
              onNodeSelected={onNodeSelected}
              mode={mode}
              view={view}
              leafParent={node.leafParent}
              submission={submission}
              viewPermissions={viewPermissions}
              editPermissions={editPermissions}
              openPermissionsModal={openPermissionsModal}
              onCheckChange={onCheckChange}
              onExpandNode={onExpandNode}
              selectInLifeCycle={selectInLifeCycle}
            />
          ))}
      </React.Fragment>
    );
  }
}

export default TreeNode;
