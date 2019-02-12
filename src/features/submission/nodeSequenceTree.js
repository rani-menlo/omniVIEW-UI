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
    sequence: PropTypes.object,
    submissionLabel: PropTypes.string
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

  getLabel = () => {
    const { sequence, submissionLabel } = this.props;
    return `${submissionLabel}\\${sequence.name} (${sequence.submission_type}-${
      sequence.submission_sub_type
    })`;
  };

  render() {
    const {
      sequence,
      paddingLeft,
      onSelected,
      selected,
      submissionLabel
    } = this.props;
    return (
      <React.Fragment>
        <div
          className={`node global__cursor-pointer ${selected === sequence &&
            "global__node-selected"}`}
          style={{ paddingLeft }}
          onClick={onSelected(sequence)}
          title={this.getLabel()}
        >
          {this.getCaretIcon()}
          <Icon type="folder" theme="filled" className="global__file-folder" />
          <span className="global__node-text global__cursor-pointer">
            {this.getLabel()}
          </span>
        </div>
        {this.state.expand &&
          _.map(sequence.childs, seq => (
            <NodeSequenceTree
              key={seq.id}
              sequence={seq}
              paddingLeft={paddingLeft + 35}
              onSelected={onSelected}
              selected={selected}
              submissionLabel={submissionLabel}
            />
          ))}
      </React.Fragment>
    );
  }
}

export default NodeSequenceTree;
