import React, { Component } from "react";
import { Pagination as PaginationLib, Input, Icon } from "antd";
import PropTypes from "prop-types";
import Row from "../row/row.component";
import PaginationButton from "./paginationButton.component";
import _ from "lodash";
import { translate } from "../../../translations/translator";
import { DEBOUNCE_TIME } from "../../../constants";

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
    this.timeOutId = "";
    this.state = {
      pageSize: this.defaultPageSize
    };
    this.onPageSizeChange = _.debounce(this.onPageSizeChange, DEBOUNCE_TIME);
  }

  componentDidMount() {
    this.setPageSizeBasedOnTotal();
  }

  setPageSizeBasedOnTotal = () => {
    let { pageSize, total } = this.props;
    if (total < pageSize) {
      pageSize = total;
    }
    this.setState({ pageSize });
  };

  getPaginationButtons = (current, type, orig) => {
    if (type === "prev") {
      return <PaginationButton label={translate("label.pagination.back")} />;
    }
    if (type === "next") {
      return <PaginationButton label={translate("label.pagination.next")} />;
    }
    return orig;
  };

  increase = () => {
    if (this.state.pageSize === "") {
      this.setPageSizeBasedOnTotal();
      return;
    }
    let pageSize = Number(this.state.pageSize);
    if (pageSize === this.props.total || this.props.total === 0) {
      return;
    }
    pageSize += this.defaultPageSize;
    if (pageSize > this.props.total) {
      pageSize = this.props.total;
    }
    this.setPageSize(pageSize);
  };

  decrease = () => {
    if (this.state.pageSize === "") {
      this.setPageSizeBasedOnTotal();
      return;
    }
    let pageSize = Number(this.state.pageSize);
    pageSize -= this.defaultPageSize;
    if (pageSize > 0 && pageSize !== this.state.pageSize) {
      this.setPageSize(pageSize);
    }
  };

  handlePageSizeChange = e => {
    const value = e.target.value;
    if (!isNaN(value)) {
      if (value === "") {
        this.setState({ pageSize: value });
      } else {
        const num = Number(value);
        if (num <= 0 || num > this.props.total) {
          return;
        }
        this.setState({ pageSize: value });
        this.onPageSizeChange();
      }
    }
  };

  onInputBlur = () => {
    const { pageSize } = this.state;
    if (!pageSize) {
      this.setState({ pageSize: this.defaultPageSize });
      this.onPageSizeChange();
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
    if (pageSize === "") {
      this.setPageSizeBasedOnTotal();
      return;
    }
    this.props.onPageChange && this.props.onPageChange(pageNo);
  };

  render() {
    const { total, showTotal, current, containerStyle } = this.props;
    return (
      <div className="pagination" style={containerStyle}>
        <PaginationLib
          showLessItems
          total={total}
          // size="small"
          showTotal={showTotal}
          pageSize={this.state.pageSize || 1}
          current={current}
          itemRender={this.getPaginationButtons}
          onChange={this.onPageChange}
        />
        <Row className="pagination__pagesize">
          <div className="pagination__pagesize__label">
            {translate("text.pagination.noofitems")}{" "}
          </div>
          <div className="pagination__pagesize__container" id={this.state.pageSize}>
            <Input
              className="pagination__pagesize__container-input"
              onChange={this.handlePageSizeChange}
              value={this.state.pageSize}
              onBlur={this.onInputBlur}
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
