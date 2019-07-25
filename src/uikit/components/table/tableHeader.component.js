import React, { Component } from "react";
import { Checkbox, Icon } from "antd";
import styled from "styled-components";
import Row from "../row/row.component";
import PropTypes from "prop-types";
import _ from "lodash";
import OmniCheckbox from "../checkbox/omniCheckbox.component";

class TableHeader extends Component {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.object),
    style: PropTypes.object,
    sortColumn: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      sortBy: "",
      orderBy: "ASC"
    };
    this.selectedColumn = null;
  }

  order = column => () => {
    if (!column.name || !column.sort) {
      return;
    }
    const state = { sortBy: column.key || "" };
    if (this.selectedColumn === column) {
      state.orderBy = this.state.orderBy === "ASC" ? "DESC" : "ASC";
    } else {
      this.selectedColumn = column;
      state.orderBy = "DESC";
    }
    this.setState(
      state,
      () =>
        this.props.sortColumn &&
        this.props.sortColumn(this.state.sortBy, this.state.orderBy)
    );
  };

  getSortIcon = column => {
    if (this.state.sortBy === column.key) {
      if (this.state.orderBy === "ASC") {
        return <IconCustom type="caret-down" />;
      } else {
        return <IconCustom type="caret-up" />;
      }
    }
    return <IconCustom type="caret-down" />;
  };

  render() {
    const { columns, style } = this.props;
    return (
      <div className="tableHeader" style={style}>
        {_.map(columns, column => (
          <RowItems
            key={column.name}
            width={column.width}
            className="tableHeader__item"
            style={column.style}
          >
            <div
              className={column.sort && "global__cursor-pointer"}
              onClick={this.order(column)}
            >
              {column.checkbox && (
                <OmniCheckbox
                  onCheckboxChange={column.onCheckboxChange}
                  checked={column.checked}
                />
              )}
              {column.name}
              {column.sort && this.getSortIcon(column)}
            </div>
          </RowItems>
        ))}
      </div>
    );
  }
}

const RowItems = styled(Row)`
  width: ${props => props.width};
  justify-content: normal;
`;

const IconCustom = styled(Icon)`
  font-size: 14px;
  margin: 3px 0px 0px 4px;
`;

export default TableHeader;
