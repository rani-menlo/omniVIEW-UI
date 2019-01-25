import React, { Component } from "react";
import { Icon } from "antd";
import _ from "lodash";
import PropTypes from "prop-types";

class NodeSequenceTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true
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
    const { sequence, paddingLeft, onSelected, selected } = this.props;
    return (
      <React.Fragment>
        <div
          className={`node global__cursor-pointer ${selected === sequence &&
            "global__node-selected"}`}
          style={{ paddingLeft }}
          onClick={onSelected(sequence)}
        >
          {this.getCaretIcon()}
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
              selected={selected}
            />
          ))}
      </React.Fragment>
    );
  }
}

export default NodeSequenceTree;
