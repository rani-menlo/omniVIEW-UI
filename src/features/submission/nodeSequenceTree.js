import React, { Component } from "react";
import { Icon } from "antd";
import _ from "lodash";
import PropTypes from "prop-types";
import { PermissionCheckbox } from "../../uikit/components";
import { CHECKBOX } from "../../constants";
import { Permissions } from "./permissions";

class NodeSequenceTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
      checkboxValue: CHECKBOX.RESET_DEFAULT
    };
  }

  componentDidMount() {
    this.setState({
      checkboxValue: this.props.sequence.hasAccess
        ? CHECKBOX.SELECTED_PARTIALLY
        : CHECKBOX.DESELECTED
    });
  }

  static propTypes = {
    paddingLeft: PropTypes.number,
    sequence: PropTypes.object,
    onCheckboxChange: PropTypes.func,
    submissionLabel: PropTypes.string,
    viewPermissions: PropTypes.bool,
    editPermissions: PropTypes.bool
  };

  static defaultProps = {
    paddingLeft: 0, // px
    viewPermissions: false,
    editPermissions: false
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

  onCheckboxChange = e => {
    let checkboxValue = this.state.checkboxValue;
    const { sequence } = this.props;
    if (checkboxValue === CHECKBOX.SELECTED_PARTIALLY) {
      checkboxValue = CHECKBOX.DESELECTED;
      Permissions.REVOKED.sequence_ids.add(sequence.json_path);
      Permissions.GRANTED.sequence_ids.delete(sequence.json_path);
    } else if (checkboxValue === CHECKBOX.DESELECTED) {
      if (sequence.hasAccess) {
        checkboxValue = CHECKBOX.SELECTED_PARTIALLY;
        Permissions.REVOKED.sequence_ids.delete(sequence.json_path);
      } else {
        checkboxValue = CHECKBOX.SELECTED;
        Permissions.GRANTED.sequence_ids.add(sequence.json_path);
      }
    } else {
      if (!sequence.hasAccess) {
        checkboxValue = CHECKBOX.DESELECTED;
      } else {
        checkboxValue = CHECKBOX.SELECTED_PARTIALLY;
      }
      Permissions.GRANTED.sequence_ids.delete(sequence.json_path);
    }
    this.setState({ checkboxValue });
    this.props.onCheckboxChange && this.props.onCheckboxChange();
  };

  render() {
    const {
      sequence,
      paddingLeft,
      onSelected,
      selected,
      submissionLabel,
      editPermissions,
      viewPermissions,
      onCheckboxChange
    } = this.props;
    return (
      <React.Fragment>
        <div
          className={`node global__cursor-pointer ${selected === sequence.id &&
            "global__node-selected"}`}
          style={{
            paddingLeft,
            opacity:
              viewPermissions || editPermissions
                ? this.state.checkboxValue === CHECKBOX.DESELECTED
                  ? 0.3
                  : 1
                : 1
          }}
          title={this.getLabel()}
        >
          {editPermissions && (
            <PermissionCheckbox
              style={{ marginRight: "10px" }}
              value={this.state.checkboxValue}
              onChange={this.onCheckboxChange}
            />
          )}
          {this.getCaretIcon()}
          <Icon
            type="folder"
            theme="filled"
            className="global__file-folder"
            onClick={onSelected(sequence)}
          />
          <span
            className="global__node-text global__cursor-pointer"
            onClick={onSelected(sequence)}
          >
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
              editPermissions={editPermissions}
              viewPermissions={viewPermissions}
              submissionLabel={submissionLabel}
              onCheckboxChange={onCheckboxChange}
            />
          ))}
      </React.Fragment>
    );
  }
}

export default NodeSequenceTree;
