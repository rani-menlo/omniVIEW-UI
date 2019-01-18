import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import FilterIcon from "../../../assets/images/filter-blue.svg";
import SortIcon from "../../../assets/images/sort.svg";
import _ from "lodash";

class NodeSequences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "submission"
    };
  }

  /* componentDidUpdate() {
    if (!this.state.selected) {
      const { sequences } = this.props;
      sequences.length && this.setState({ selected: sequences[0] });
    }
  } */

  static propTypes = {
    sequences: PropTypes.arrayOf(PropTypes.object),
    selected: PropTypes.object,
    onSelectedSequence: PropTypes.func
  };

  static defaultProps = {
    sequences: []
  };

  sortBy = sortBy => () => {
    this.setState({ sortBy });
  };

  onSelected = sequence => () => {
    const { onSelectedSequence } = this.props;
    onSelectedSequence && onSelectedSequence(sequence);
  };

  iterateTreeSequence = sequence => {
    if (_.get(sequence, "childs.length", 0)) {
      return (
        <React.Fragment>
          <div className="node" onClick={this.selectNode}>
            <Icon type="caret-right" className="global__caret" />
            <span className="global__node-text">{sequence.name}</span>
          </div>
          {_.map(sequence.childs, seq => this.iterateTreeSequence(seq))}
        </React.Fragment>
      );
    } else {
      return <div>{sequence.name}</div>;
    }
  };

  getTree = () => {
    const { sequences } = this.props;
    return _.map(sequences, sequence => this.iterateTreeSequence(sequence));
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
            <img src={FilterIcon} />
            <span className="label">Submission Type</span>
          </div>
          <div
            className={`sortheader__section ${sortBy === "sequence" &&
              "selected-sortby"}`}
            onClick={this.sortBy("sequence")}
          >
            <img src={SortIcon} />
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
