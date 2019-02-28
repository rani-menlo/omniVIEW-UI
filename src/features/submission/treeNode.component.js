import React, { Component } from "react";
import { Icon } from "antd";
import PropTypes from "prop-types";
import _ from "lodash";
import uuidv4 from "uuid/v4";
import { withRouter } from "react-router-dom";

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
  }

  static propTypes = {
    content: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
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
    ])
  };

  static defaultProps = {
    paddingLeft: 0, // px
    defaultPaddingLeft: 31, // px
    expand: false,
    defaultExpand: false
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
    const nodes = [];
    // get object from the ectd:ectd
    content = _.get(content, "ectd:ectd", content);
    // In standard mode, all STF files to consolidated into single based on name
    if (mode === "standard") {
      const { consolidatedFolder, omitKeys } = this.getStfFolders(content);
      if (omitKeys.length) {
        content = _.omit(content, omitKeys);
      }
      _.map(consolidatedFolder, (value, key) => {
        content[key] = value;
      });
    }
    const version = _.get(content, "version", "");
    if (version && version.includes("STF")) {
      if (mode === "qc") {
        const keys = [];
        _.map(content, (value, key) => {
          if (typeof value === "object") {
            keys.push(key);
          }
        });
        let leaf = [];
        _.map(keys, key => {
          if (content[key].leaf) {
            leaf = [...leaf, ...content[key].leaf];
          }
        });
        content = _.omit(content, keys);
        content.leaf = leaf;
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
    this.setState({ properties, nodes });
  }

  getStfFolders = rootFolder => {
    const folders = [];
    const omitKeys = [];
    _.map(rootFolder, (value, key) => {
      const version = _.get(value, "version", "");
      if (typeof value === "object" && version.includes("STF")) {
        omitKeys.push(key);
        const k = key.substring(0, key.lastIndexOf("[")) || key;
        folders.push({ ..._.cloneDeep(value), _objectKey: k });
      }
    });
    const groupedFldrs = _.groupBy(folders, "_objectKey");
    const consolidatedFolder = {};
    _.map(groupedFldrs, (array, key) => {
      const subFoldr = {};
      _.map(array, item => {
        subFoldr.title = item._objectKey;
        _.map(item, (v, k) => {
          if (typeof v === "object") {
            if (subFoldr[k]) {
              subFoldr[k].leaf = [...subFoldr[k].leaf, ...v.leaf];
            } else {
              subFoldr[k] = v;
            }
          }
        });
      });
      consolidatedFolder[key] = subFoldr;
    });
    return { consolidatedFolder, omitKeys };
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
    if (properties.title === "US Regional") {
      icon = (
        <img
          src="/images/folder-us.svg"
          className="global__file-folder"
          style={style}
        />
      );
    }
    if (version && version.includes("STF")) {
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
    const { onNodeSelected, leafParent } = this.props;
    onNodeSelected &&
      onNodeSelected(this.state.nodeId, this.state.properties, leafParent);
  };

  deSelectNode = () => {
    this.setState({ selected: false });
  };

  getLabel = () => {
    const { label, mode } = this.props;
    const { properties } = this.state;
    let name = label;
    if (label === "leaf" || mode === "standard") {
      name = _.get(properties, "title", label);
    }

    return name;
  };

  openFile = () => {
    const { properties } = this.state;
    const fileHref = properties["xlink:href"];
    /* const types = fileHref && fileHref.split(".");
    const type = _.get(types, "[1]", "pdf"); */
    const type = fileHref.substring(fileHref.lastIndexOf(".") + 1);
    if (type.includes("pdf") && properties.fileID) {
      window.open(
        `${process.env.PUBLIC_URL}/viewer/pdf/${properties.fileID}`,
        "_blank"
      );
    } else {
      properties.fileID &&
        window.open(
          `${process.env.PUBLIC_URL}/viewer/${type}/${properties.fileID}`,
          "_blank"
        );
    }
  };

  render() {
    const { nodes, expand } = this.state;
    const {
      defaultPaddingLeft,
      selectedNodeId,
      onNodeSelected,
      mode,
      view
    } = this.props;
    const paddingLeft = this.props.paddingLeft + defaultPaddingLeft;
    return (
      <React.Fragment>
        <div
          className={`node ${selectedNodeId === this.state.nodeId &&
            "global__node-selected"}`}
          style={{ paddingLeft }}
          onClick={this.selectNode}
          onDoubleClick={this.openFile}
          title={this.getLabel()}
        >
          {this.getCaretIcon()}
          {this.getLeafIcon()}
          <span className="global__node-text" style={{ overflow: "hidden" }}>
            {this.getLabel()}
          </span>
        </div>
        {expand &&
          _.map(nodes, (node, idx) => (
            <TreeNode
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
            />
          ))}
      </React.Fragment>
    );
  }
}

export default withRouter(TreeNode);
