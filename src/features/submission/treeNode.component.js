import React, { Component } from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';
import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import FileNew from '../../../assets/images/file-new.svg';
import FileAppend from '../../../assets/images/file-append.svg';
import FileReplace from '../../../assets/images/file-replace.svg';
import FileDelete from '../../../assets/images/file-delete.svg';

class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeId: uuidv4(),
      properties: {},
      nodes: [],
      expand: this.props.expand,
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
    onNodeSelected: PropTypes.func
  };

  static defaultProps = {
    paddingLeft: 0, // px
    defaultPaddingLeft: 31, // px
    expand: false
  };

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    if (props.expand !== state.prevProps.expand) {
      newState.expand = props.expand;
    }
    return _.size(newState) ? { ...newState, prevProps: props } : null;
  }

  componentDidMount() {
    let { content } = this.props;
    const properties = {};
    const nodes = [];
    content = _.get(content, 'ectd:ectd', content);
    _.map(content, (value, key) => {
      if (typeof value === 'string') {
        properties[key] = value;
      } else {
        const node = { label: key, value };
        if (_.isArray(value) && key === 'leaf') {
          _.map(value, val => {
            const newNode = { label: 'leaf', value: val };
            nodes.push(newNode);
          });
        } else {
          nodes.push(node);
        }
      }
    });
    this.setState({ properties, nodes });
  }

  toggle = () => {
    this.setState({ expand: !this.state.expand });
  };

  getCaretIcon = () => {
    if (this.props.label === 'leaf') {
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
    if (this.props.label === 'leaf') {
      const { properties } = this.state;
      if (properties.operation === 'new') {
        icon = <img src={FileNew} className="global__file-folder" />;
      } else if (properties.operation === 'append') {
        icon = <img src={FileAppend} className="global__file-folder" />;
      } else if (properties.operation === 'replace') {
        icon = <img src={FileReplace} className="global__file-folder" />;
      } else {
        icon = <img src={FileDelete} className="global__file-folder" />;
      }
    }
    return icon;
  };

  selectNode = () => {
    const { onNodeSelected } = this.props;
    onNodeSelected && onNodeSelected(this.state.nodeId, this.state.properties);
  };

  deSelectNode = () => {
    this.setState({ selected: false });
  };

  render() {
    const {
      nodes,
      expand,
      properties: { title }
    } = this.state;
    const {
      defaultPaddingLeft,
      label,
      selectedNodeId,
      onNodeSelected
    } = this.props;
    const paddingLeft = this.props.paddingLeft + defaultPaddingLeft;
    return (
      <React.Fragment>
        <div
          className={`node ${selectedNodeId === this.state.nodeId &&
            'global__node-selected'}`}
          style={{ paddingLeft }}
          onClick={this.selectNode}
        >
          {this.getCaretIcon()}
          {this.getLeafIcon()}
          <span className="global__node-text">
            {label === 'leaf' ? title : label || 'Submission[Life cycle view]'}
          </span>
        </div>
        {expand &&
          _.map(nodes, (node, idx) => (
            <TreeNode
              expand={this.props.expand}
              paddingLeft={paddingLeft}
              key={node.label + idx}
              label={node.label}
              content={node.value}
              selectedNodeId={selectedNodeId}
              onNodeSelected={onNodeSelected}
            />
          ))}
      </React.Fragment>
    );
  }
}

export default TreeNode;
