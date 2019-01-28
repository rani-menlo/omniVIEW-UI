import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import _ from "lodash";
import NodeSequenceTree from "./nodeSequenceTree";

class NodeSequences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "submission",
      order: "desc"
    };
  }

  static propTypes = {
    sequences: PropTypes.arrayOf(PropTypes.object),
    selected: PropTypes.object,
    onSelectedSequence: PropTypes.func
  };

  static defaultProps = {
    sequences: []
  };

  sortBy = sortBy => () => {
    this.setState({
      sortBy,
      order: this.state.order === "desc" ? "asc" : "desc"
    });
  };

  onSelected = sequence => () => {
    const { onSelectedSequence } = this.props;
    onSelectedSequence && onSelectedSequence(sequence);
  };

  getTree = () => {
    const { sequences, selected } = this.props;
    return _.map(sequences, sequence => (
      <NodeSequenceTree
        sequence={sequence}
        onSelected={this.onSelected}
        selected={selected}
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
    const newArray = _.sortBy(array, s => Number(s.name));
    return this.state.order === "desc" ? newArray : newArray.reverse();
  };

  getList = () => {
    const { sequences } = this.props;
    let array = [];
    _.map(sequences, sequence => {
      array = array.concat(this.getListSequence(sequence));
    });
    return array;
  };

  render() {
    const { sortBy } = this.state;
    const { selected } = this.props;
    return (
      <React.Fragment>
        <div className="sortheader">
          <div className="sortheader__text">Sort by:</div>
          <div
            className={`sortheader__section ${sortBy === "submission" &&
              "selected-sortby"}`}
            onClick={this.sortBy("submission")}
          >
            <img src='/images/filter-blue.svg' />
            <span className="label">Submission Type</span>
          </div>
          <div
            className={`sortheader__section ${sortBy === "sequence" &&
              "selected-sortby"}`}
            onClick={this.sortBy("sequence")}
          >
            <img src='/images/sort.svg' />
            <span className="label">Sequence</span>
          </div>
        </div>
        <div className="sequenceslist">
          {sortBy === "submission"
            ? this.getTree()
            : _.map(this.getList(), sequence => (
                <div
                  key={sequence.id}
                  onClick={this.onSelected(sequence)}
                  className={`sequenceslist__sequence global__cursor-pointer ${selected ===
                    sequence && "global__node-selected"}`}
                >
                  <Icon
                    type="folder"
                    theme="filled"
                    className="global__file-folder"
                  />
                  <span className="global__node-text global__cursor-pointer">
                    {sequence.name}
                  </span>
                </div>
              ))}
        </div>
      </React.Fragment>
    );
  }
}

export default NodeSequences;
