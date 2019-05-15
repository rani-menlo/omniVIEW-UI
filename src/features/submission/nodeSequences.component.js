import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import _ from "lodash";
import NodeSequenceTree from "./nodeSequenceTree";
import { PermissionCheckbox } from "../../uikit/components";
import { CHECKBOX } from "../../constants";
import { Permissions } from "./permissions";

class NodeSequences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: "desc",
      sequencesList: []
    };
  }

  static propTypes = {
    sequences: PropTypes.arrayOf(PropTypes.object),
    onCheckboxChange: PropTypes.func,
    selected: PropTypes.number,
    onSelectedSequence: PropTypes.func,
    sortBy: PropTypes.oneOf(["submission, sequence"]),
    onSortByChanged: PropTypes.func,
    submissionLabel: PropTypes.string,
    viewPermissions: PropTypes.bool,
    editPermissions: PropTypes.bool
  };

  static defaultProps = {
    sequences: [],
    sortBy: "submission",
    viewPermissions: false,
    editPermissions: false
  };

  static getList = sequences => {
    let array = [];
    _.map(sequences, sequence => {
      array = array.concat(NodeSequences.getListSequence(sequence));
    });
    const newArray = _.sortBy(array, s => Number(s.name));
    return newArray;
  };

  static getListSequence = (sequence, array = []) => {
    if (!_.has(sequence, "checkboxValue")) {
      sequence.checkboxValue = sequence.hasAccess
        ? CHECKBOX.SELECTED_PARTIALLY
        : CHECKBOX.DESELECTED;
    }
    array.push(sequence);
    if (_.get(sequence, "childs.length", 0)) {
      _.map(sequence.childs, seq => {
        NodeSequences.getListSequence(seq, array);
      });
    }
    return array;
  };

  static getDerivedStateFromProps(props, state) {
    if (
      (props.sequences.length && !state.sequencesList.length) ||
      props.viewPermissions
    ) {
      return { sequencesList: NodeSequences.getList(props.sequences) };
    }
    return null;
  }

  componentDidMount() {
    this.setState({
      sequencesList: NodeSequences.getList(this.props.sequences)
    });
  }

  sortBy = sortBy => () => {
    const { onSortByChanged } = this.props;
    let newArray = [...this.state.sequencesList];
    newArray = this.state.order === "desc" ? newArray.reverse() : newArray;
    this.setState(
      {
        order: this.state.order === "desc" ? "asc" : "desc",
        sequencesList: newArray
      },
      () => onSortByChanged && onSortByChanged(sortBy)
    );
  };

  onSelected = sequence => () => {
    const { onSelectedSequence } = this.props;
    onSelectedSequence && onSelectedSequence(sequence);
  };

  getTree = () => {
    const {
      selected,
      submissionLabel,
      editPermissions,
      viewPermissions,
      onCheckboxChange
    } = this.props;
    return _.map(this.props.sequences, sequence => (
      <NodeSequenceTree
        key={`${sequence.id}_${_.get(sequence, "hasAccess")}`}
        sequence={sequence}
        onSelected={this.onSelected}
        selected={selected}
        submissionLabel={submissionLabel}
        editPermissions={editPermissions}
        viewPermissions={viewPermissions}
        onCheckboxChange={onCheckboxChange}
      />
    ));
  };

  onCheckboxChange = sequence => () => {
    const sequencesList = [...this.state.sequencesList];
    const idx = _.findIndex(sequencesList, seq => seq.id === sequence.id);
    const newSequence = { ...sequence };
    if (newSequence.checkboxValue === CHECKBOX.SELECTED_PARTIALLY) {
      newSequence.checkboxValue = CHECKBOX.DESELECTED;
      Permissions.REVOKED.sequence_ids.add(newSequence.json_path);
      Permissions.GRANTED.sequence_ids.delete(newSequence.json_path);
    } else if (newSequence.checkboxValue === CHECKBOX.DESELECTED) {
      if (newSequence.hasAccess) {
        newSequence.checkboxValue = CHECKBOX.SELECTED_PARTIALLY;
        Permissions.REVOKED.sequence_ids.delete(newSequence.json_path);
      } else {
        newSequence.checkboxValue = CHECKBOX.SELECTED;
        Permissions.GRANTED.sequence_ids.add(newSequence.json_path);
      }
    } else {
      if (!newSequence.hasAccess) {
        newSequence.checkboxValue = CHECKBOX.DESELECTED;
        Permissions.GRANTED.sequence_ids.delete(newSequence.json_path);
        Permissions.REVOKED.sequence_ids.add(newSequence.json_path);
      } else {
        newSequence.checkboxValue = CHECKBOX.SELECTED_PARTIALLY;
        Permissions.GRANTED.sequence_ids.delete(newSequence.json_path);
      }
    }

    sequencesList[idx] = newSequence;
    this.setState({ sequencesList });
    this.props.onCheckboxChange && this.props.onCheckboxChange();
  };

  render() {
    const {
      selected,
      sortBy,
      submissionLabel,
      viewPermissions,
      editPermissions
    } = this.props;
    return (
      <React.Fragment>
        <div className="sortheader">
          <div
            className={`sortheader__section ${sortBy === "submission" &&
              "selected-sortby"}`}
            onClick={this.sortBy("submission")}
          >
            <img src="/images/filter-blue.svg" />
            <span className="label">Submission Type</span>
          </div>
          <div
            className={`sortheader__section ${sortBy === "sequence" &&
              "selected-sortby"}`}
            onClick={this.sortBy("sequence")}
          >
            <img src="/images/sort.svg" />
            <span className="label">Sequence</span>
          </div>
        </div>
        <div className="sequenceslist">
          {sortBy === "submission"
            ? this.getTree()
            : _.map(this.state.sequencesList, sequence => (
                <div
                  key={sequence.id}
                  className={`sequenceslist__sequence global__cursor-pointer ${selected ===
                    sequence.id && "global__node-selected"}`}
                  style={{
                    opacity:
                      viewPermissions || editPermissions
                        ? sequence.checkboxValue === CHECKBOX.DESELECTED
                          ? 0.3
                          : 1
                        : 1
                  }}
                >
                  {editPermissions && (
                    <PermissionCheckbox
                      style={{ marginRight: "10px" }}
                      value={sequence.checkboxValue}
                      onChange={this.onCheckboxChange(sequence)}
                    />
                  )}
                  <Icon
                    type="folder"
                    theme="filled"
                    className="global__file-folder"
                    onClick={this.onSelected(sequence)}
                  />
                  <span
                    className="global__node-text global__cursor-pointer"
                    onClick={this.onSelected(sequence)}
                  >
                    {`${submissionLabel}\\${sequence.name}`}
                  </span>
                </div>
              ))}
        </div>
      </React.Fragment>
    );
  }
}

export default NodeSequences;
