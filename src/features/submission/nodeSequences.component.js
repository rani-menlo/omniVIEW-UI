import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import _ from "lodash";
import NodeSequenceTree from "./nodeSequenceTree";
import { PermissionCheckbox } from "../../uikit/components";
import { CHECKBOX } from "../../constants";
import { Permissions } from "./permissions";
import { getOrderedSequences } from "../../utils";

class NodeSequences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: "desc"
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

  sortBy = sortBy => () => {
    const { onSortByChanged } = this.props;
    this.setState(
      {
        order: this.state.order === "desc" ? "asc" : "desc"
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
      sequences,
      selected,
      submissionLabel,
      viewPermissions,
      editPermissions
    } = this.props;
    return _.map(sequences, sequence => (
      <NodeSequenceTree
        key={sequence.id}
        sequence={sequence}
        onSelected={this.onSelected}
        selected={selected}
        submissionLabel={submissionLabel}
        onCheckboxChange={this.onCheckboxChange}
        viewPermissions={viewPermissions}
        editPermissions={editPermissions}
      />
    ));
  };

  getListSequence = (sequence, array = []) => {
    array.push(sequence);
    if (_.get(sequence, "childs.length", 0)) {
      _.map(sequence.childs, seq => {
        this.getListSequence(seq, array);
      });
    }
    return array;
  };

  getList = () => {
    const { sequences } = this.props;
    let array = [];
    _.map(sequences, sequence => {
      array = array.concat(this.getListSequence(sequence));
    });
    const newArray = _.sortBy(array, s => Number(s.name));
    return this.state.order === "desc" ? newArray : newArray.reverse();
  };

  onCheckboxChange = sequence => () => {
    /* const sequencesList = [...this.state.sequencesList];
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
    this.setState({ sequencesList }); */
    this.props.onSequenceCheckboxChange &&
      this.props.onSequenceCheckboxChange(sequence);
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
            : _.map(
                getOrderedSequences(this.props.sequences, this.state.order),
                sequence => (
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
                )
              )}
        </div>
      </React.Fragment>
    );
  }
}

export default NodeSequences;
