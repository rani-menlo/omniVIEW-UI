import React, { Component } from "react";
import { Icon } from "antd";
import _ from "lodash";
import PropTypes from "prop-types";

class NodeSequenceTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false
    };
  }

  static propTypes = {
    paddingLeft: PropTypes.number,
    sequence: PropTypes.object
  };

  static defaultProps = {
    paddingLeft: 0 // px
  };

  toggle = () => {
    this.setState({ expand: !this.state.expand });
  };

  getCaretIcon = () => {
    if (_.get(this.props, "sequence.childs.length", 0) === 0) {
      return null;
    }
    const style = { verticalAlign: 0 };
    return this.state.expand ? (
      <Icon
        type="caret-down"
        onClick={this.toggle}
        className="global__caret"
        style={style}
      />
    ) : (
      <Icon
        type="caret-right"
        onClick={this.toggle}
        style={style}
        className="global__caret"
      />
    );
  };

  render() {
    const { sequence, paddingLeft, onSelected } = this.props;
    return (
      <div className="global__cursor-pointer">
        {this.getCaretIcon()}
        <div
          className="node"
          style={{ paddingLeft, display: "inline-flex" }}
          onClick={onSelected(sequence)}
        >
          <Icon type="folder" theme="filled" className="global__file-folder" />
          <span className="global__node-text global__cursor-pointer">
            {sequence.name}
          </span>
        </div>
        {this.state.expand &&
          _.map(sequence.childs, seq => (
            <NodeSequenceTree
              sequence={seq}
              paddingLeft={paddingLeft + 35}
              onSelected={onSelected}
            />
          ))}
      </div>
    );
  }
}

export default NodeSequenceTree;
