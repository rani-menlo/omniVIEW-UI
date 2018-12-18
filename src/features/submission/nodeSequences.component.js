import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import FilterIcon from '../../../assets/images/filter.svg';
import SortIcon from '../../../assets/images/sort.svg';
import _ from 'lodash';

class NodeSequences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 'filter'
    };
  }

  static propTypes = {
    sequences: PropTypes.arrayOf(PropTypes.string),
    onSelectedSequence: PropTypes.func
  };

  filter = () => {
    this.setState({ selected: 'filter' });
  };

  sort = () => {
    this.setState({ selected: 'sort' });
  };

  onSelected = sequence => () => {
    const { onSelectedSequence } = this.props;
    onSelectedSequence && onSelectedSequence(sequence);
  };

  render() {
    const { selected } = this.state;
    const { sequences } = this.props;
    return (
      <React.Fragment>
        <div className="sortheader">
          <div className="sortheader__text">Sort by:</div>
          <div
            className={`sortheader__section ${selected === 'filter' &&
              'selected-section'}`}
            onClick={this.filter}
          >
            <img src={FilterIcon} />
            <span className="label">Submission Type</span>
          </div>
          <div
            className={`sortheader__section ${selected === 'sort' &&
              'selected-section'}`}
            onClick={this.sort}
          >
            <img src={SortIcon} />
            <span className="label">Sequence</span>
          </div>
        </div>
        <div className="sequenceslist">
          {_.map(sequences, sequence => (
            <div key={sequence} onClick={this.onSelected(sequence)}>
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
