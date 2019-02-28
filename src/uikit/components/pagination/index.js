import React, { Component } from "react";
import { Pagination as PaginationLib, Input, Icon } from "antd";
import PropTypes from "prop-types";
import Row from "../row/row.component";
import PaginationButton from "./paginationButton.component";
import _ from "lodash";

class Pagination extends Component {
  static propTypes = {
    total: PropTypes.number,
    showTotal: PropTypes.func,
    pageSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    current: PropTypes.number,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    containerStyle: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.defaultPageSize = 5;
    this.debounceTimeOut = 700;
    this.timeOutId = "";
    this.state = {
      pageSize: this.defaultPageSize
    };
    this.onPageSizeChange = _.debounce(
      this.onPageSizeChange,
      this.debounceTimeOut
    );
  }

  componentDidMount() {
    let { pageSize, total } = this.props;
    if (total < pageSize) {
      pageSize = total;
    }
    this.setState({ pageSize });
  }

  getPaginationButtons = (current, type, orig) => {
    if (type === "prev") {
      return <PaginationButton label="Back" />;
    }
    if (type === "next") {
      return <PaginationButton label="Next" />;
    }
    return orig;
  };

  increase = () => {
    let pageSize = Number(this.state.pageSize);
    if (pageSize === this.props.total) {
      return;
    }
    pageSize += this.defaultPageSize;
    if (pageSize > this.props.total) {
      pageSize = this.props.total;
    }
    this.setPageSize(pageSize);
  };

  decrease = () => {
    let pageSize = Number(this.state.pageSize);
    pageSize -= pageSize % this.defaultPageSize;
    if (pageSize > 0 && pageSize !== this.state.pageSize) {
      this.setPageSize(pageSize);
    }
  };

  handlePageSizeChange = e => {
    const value = e.target.value;
    if (!isNaN(value)) {
      if (value === "") {
        this.setState({ pageSize: value });
        this.timeOutId = setTimeout(() => {
          this.setState({ pageSize: 1 });
          this.onPageSizeChange();
        }, this.debounceTimeOut);
      } else {
        clearTimeout(this.timeOutId);
        const num = Number(value);
        if (num <= 0 || num > this.props.total) {
          return;
        }
        this.setState({ pageSize: value });
        this.onPageSizeChange();
      }
    }
  };

  onPageSizeChange = () => {
    if (this.state.pageSize && this.props.onPageSizeChange) {
      this.props.onPageSizeChange(this.state.pageSize);
      this.onPageChange(1);
    }
  };

  setPageSize = pageSize => {
    this.setState({ pageSize });
    this.props.onPageSizeChange && this.props.onPageSizeChange(pageSize);
  };

  onPageChange = (pageNo, pageSize) => {
    this.props.onPageChange && this.props.onPageChange(pageNo);
  };

  render() {
    const { total, showTotal, current, containerStyle } = this.props;
    return (
      <div className="pagination" style={containerStyle}>
        <PaginationLib
          total={total}
          showTotal={showTotal}
          pageSize={this.state.pageSize}
          current={current}
          itemRender={this.getPaginationButtons}
          onChange={this.onPageChange}
        />
        <Row className="pagination__pagesize">
          <div className="pagination__pagesize__label">Number of Items: </div>
          <div className="pagination__pagesize__container">
            <Input
              className="pagination__pagesize__container-input"
              onChange={this.handlePageSizeChange}
              value={this.state.pageSize}
            />
            <div className="pagination__pagesize__container-arrows">
              <Icon
                type="caret-up"
                onClick={this.increase}
                className="global__cursor-pointer"
              />
              <Icon
                type="caret-down"
                onClick={this.decrease}
                className="global__cursor-pointer"
              />
            </div>
          </div>
        </Row>
      </div>
    );
  }
}

export default Pagination;
