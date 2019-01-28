import React, { Component } from "react";
import { Icon } from "antd";
import PropTypes from "prop-types";
import _ from "lodash";
import uuidv4 from "uuid/v4";
import { SERVER_URL, URI } from "../../constants";

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
    content: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
      .isRequired,
    label: PropTypes.string.isRequired,
    paddingLeft: PropTypes.number,
    defaultPaddingLeft: PropTypes.number,
    expand: PropTypes.bool,
    selectedNodeId: PropTypes.string,
    onNodeSelected: PropTypes.func,
    mode: PropTypes.oneOf(["standard", "qc"]),
    view: PropTypes.oneOf(["current", "lifeCycle"]),
    defaultExpand: PropTypes.bool,
    leafParent: PropTypes.object | PropTypes.arrayOf(PropTypes.object)
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
    let { content, view } = this.props;
    const properties = {};
    const nodes = [];
    content = _.get(content, "ectd:ectd", content);
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
    if (this.props.label === "leaf") {
      const { properties } = this.state;
      const style = { width: "18px", height: "21px" };
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
    const append = [];
    if (properties["product-name"]) {
      append.push(properties["product-name"]);
    }
    if (properties.substance) {
      append.push(properties.substance);
    }
    if (properties.manufacturer) {
      append.push(properties.manufacturer);
    }
    if (properties.dosageform) {
      append.push(properties.dosageform);
    }
    return `${name} ${append.length > 0 ? `(${append.join(", ")})` : ""}`;
  };

  openFile = () => {
    const { properties } = this.state;
    properties.fileID &&
      window.open(
        `${SERVER_URL}${URI.GET_RESOURCE_FILE}/${properties.fileID}`,
        "_blank"
      );
  };

  render() {
    const { nodes, expand } = this.state;
    const {
      defaultPaddingLeft,
      selectedNodeId,
      onNodeSelected,
      mode,
      view,
      defaultExpand
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
        >
          {this.getCaretIcon()}
          {this.getLeafIcon()}
          <span className="global__node-text">{this.getLabel()}</span>
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

export default TreeNode;
