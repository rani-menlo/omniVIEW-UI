import React from "react";
import { Input } from "antd";
import PropTypes from "prop-types";

const SearchBox = ({
  placeholder,
  searchText,
  clearSearch,
  onChange,
  className,
  style
}) => {
  return (
    <Input
      style={style}
      value={searchText}
      className={`searchBox ${className}`}
      prefix={<img src="/images/search.svg" style={{ marginLeft: "5px" }} />}
      suffix={
        searchText ? (
          <img
            src="/images/close.svg"
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer"
            }}
            onClick={clearSearch}
          />
        ) : (
          ""
        )
      }
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};

SearchBox.propTypes = {
  placeholder: PropTypes.string,
  searchText: PropTypes.string,
  clearSearch: PropTypes.func,
  onChange: PropTypes.func
};

SearchBox.defaultProps = {
  placeholder: "",
  searchText: ""
};

export default React.memo(SearchBox);