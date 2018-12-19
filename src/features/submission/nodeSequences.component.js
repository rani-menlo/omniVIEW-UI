import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import FilterIcon from "../../../assets/images/filter.svg";
import SortIcon from "../../../assets/images/sort.svg";
import _ from "lodash";

class NodeSequences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "filter",
      selected: ""
    };
  }

  componentDidUpdate() {
    if (!this.state.selected) {
      const { sequences } = this.props;
      sequences.length && this.setState({ selected: sequences[0] });
    }
  }

  static propTypes = {
    sequences: PropTypes.arrayOf(PropTypes.string),
    onSelectedSequence: PropTypes.func
  };

  static defaultProps = {
    sequences: []
  };

  filter = () => {
    this.setState({ sortBy: "filter" });
  };

  sort = () => {
    this.setState({ sortBy: "sort" });
  };

  onSelected = sequence => () => {
    if (sequence === this.state.selected) {
      return;
    }
    this.setState({ selected: sequence });
    const { onSelectedSequence } = this.props;
    onSelectedSequence && onSelectedSequence(sequence);
  };

  render() {
    const { sortBy } = this.state;
    const { sequences } = this.props;
    return (
      <React.Fragment>
        <div className="sortheader">
          <div className="sortheader__text">Sort by:</div>
          <div
            className={`sortheader__section ${sortBy === "filter" &&
              "selected-sortby"}`}
            onClick={this.filter}
          >
            <img src={FilterIcon} />
            <span className="label">Submission Type</span>
          </div>
          <div
            className={`sortheader__section ${sortBy === "sort" &&
              "selected-sortby"}`}
            onClick={this.sort}
          >
            <img src={SortIcon} />
            <span className="label">Sequence</span>
          </div>
        </div>
        <div className="sequenceslist">
          {_.map(sequences, sequence => (
            <div
              key={sequence}
              onClick={this.onSelected(sequence)}
              className={`sequenceslist__sequence ${this.state.selected ===
                sequence && "global__node-selected"}`}
            >
              <Icon
                type="folder"
                theme="filled"
                className="global__file-folder"
              />
              <span className="global__node-text">{sequence}</span>
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

export default NodeSequences;
