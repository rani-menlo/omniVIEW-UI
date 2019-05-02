import React, { Component } from "react";
import { Icon, Checkbox } from "antd";
import PropTypes from "prop-types";
import _ from "lodash";
import uuidv4 from "uuid/v4";

class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeId: uuidv4(),
      properties: {},
      nodes: [],
      expand: this.props.defaultExpand || this.props.expand,
      prevProps: this.props
    };
    this.nodeRefs = [];
    this.nodeElementRef = React.createRef();
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
    mode: PropTypes.oneOf(["standard", "qc"]),
    view: PropTypes.oneOf(["current", "lifeCycle"]),
    defaultExpand: PropTypes.bool,
    leafParent: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    assignPermissions: PropTypes.bool
  };

  static defaultProps = {
    paddingLeft: 0, // px
    defaultPaddingLeft: 31, // px
    expand: false,
    defaultExpand: false,
    assignPermissions: false
  };

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    if (props.expand !== state.prevProps.expand) {
      newState.expand = props.expand;
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
            _.map(stfFolder, (value, key) => {
              if (typeof value === "object") {
                keys.push(key);
                if (value.leaf) {
                  leaf = [...leaf, ...value.leaf];
                }
              }
            });
            leaf = _.sortBy(leaf, "ID");
            stfFolder = _.omit(stfFolder, keys);
            stfFolder.leaf = leaf;
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
      if (typeof value === "string" || typeof value === "boolean") {
        properties[key] = value;
      } else {
        const node = { label: key, value };
        if (_.isArray(value) && key === "leaf") {
          _.map(value, val => {
            this.setCurrentView(val, value);
            if (view === "current" && !val.showInCurrentView) {
              return;
            }
            const newNode = { label: "leaf", value: val, leafParent: value };
            nodes.push(newNode);
          });
        } else if (value.version && value.version.includes("STF")) {
          const groups = _.groupBy(content, val => val.title);
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
    if (properties["_stfKey"] && mode === "standard") {
      nodes = this.sortByTitle(nodes);
    }
    this.setState({ properties, nodes });
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
    titles = titles.sort(collator.compare);
    let lastItem = titles[titles.length - 1];
    if (lastItem && lastItem.includes("Synopsis")) {
      _.remove(titles, item => item === lastItem);
      titles = [lastItem, ...titles];
    }
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
    /* const folders = [];
    const omitKeys = [];
    _.map(rootFolder, (value, key) => {
      const version = _.get(value, "version", "");
      if (typeof value === "object" && version.includes("STF")) {
        omitKeys.push(key);
        const k = key.substring(0, key.lastIndexOf("[")) || key;
        folders.push({ ..._.cloneDeep(value), _objectKey: k });
      }
    }); */
    const { view } = this.props;
    const groupedFldrs = _.groupBy(stfFolders, "_stfKey");
    const consolidatedFolder = {};
    _.map(groupedFldrs, (array, key) => {
      const subFoldr = {};
      _.map(array, item => {
        subFoldr.title = item.title;
        subFoldr["_stfKey"] = item["_stfKey"];
        subFoldr["_omitKey"] = item["_omitKey"];
        _.map(item, (v, k) => {
          if (typeof v === "object") {
            if (subFoldr[k]) {
              let leaf = [...subFoldr[k].leaf, ...v.leaf];
              if (view === "current") {
                leaf = this.setLatestFiles(leaf);
              }
              subFoldr[k].leaf = leaf;
            } else {
              subFoldr[k] = v;
            }
          }
        });
      });
      consolidatedFolder[key] = subFoldr;
    });
    return consolidatedFolder;
  };

  setLatestFiles = array => {
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

  setCurrentView = (obj, array) => {
    const itemsByTitle = _.groupBy(array, "title");
    const items = itemsByTitle[obj.title];
    const operation = _.get(items, `[${items.length - 1}].operation`, "");
    obj.showInCurrentView =
      operation !== "delete" && obj.operation === operation;
  };

  toggle = () => {
    this.setState({ expand: !this.state.expand });
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
      if (properties.operation === "new") {
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
        extraProperties
      );
  };

  deSelectNode = () => {
    this.setState({ selected: false });
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
    const fileHref = properties["xlink:href"];
    /* const types = fileHref && fileHref.split(".");
    const type = _.get(types, "[1]", "pdf"); */
    const type = fileHref.substring(fileHref.lastIndexOf(".") + 1);
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

  render() {
    const { nodes, expand } = this.state;
    const {
      defaultPaddingLeft,
      selectedNodeId,
      onNodeSelected,
      mode,
      view,
      submission,
      assignPermissions
    } = this.props;
    const paddingLeft = this.props.paddingLeft + defaultPaddingLeft;
    return (
      <React.Fragment>
        <div
          ref={this.nodeElementRef}
          className={`node ${selectedNodeId === this.state.nodeId &&
            "global__node-selected"}`}
          style={{ display: "flex" }}
          title={this.getLabel()}
          onClick={this.selectNode}
          onDoubleClick={this.openFile}
        >
          {assignPermissions ? (
            <Checkbox style={{ marginLeft: "10px" }} />
          ) : null}
          <div style={{ paddingLeft }}>
            {this.getCaretIcon()}
            {this.getLeafIcon()}
            <span className="global__node-text" style={{ overflow: "hidden" }}>
              {this.getLabel()}
            </span>
          </div>
        </div>
        {expand &&
          _.map(nodes, (node, idx) => (
            <TreeNode
              ref={this.nodeRefs[idx]}
              expand={this.props.expand}
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
              assignPermissions={assignPermissions}
            />
          ))}
      </React.Fragment>
    );
  }
}

export default TreeNode;
