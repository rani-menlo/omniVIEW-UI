import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { Select } from "antd";

const { Option } = Select;

const SelectField = ({
  label,
  options,
  selectedValue,
  placeholder,
  onChange,
  error,
  style,
  selectFieldStyle,
  className,
  selectFieldClassName
}) => {
  return (
    <div style={style} className={className}>
      {label && <p className="global__field-label">{label}</p>}
      <Select
        style={selectFieldStyle}
        defaultValue={selectedValue}
        onChange={onChange}
        className={selectFieldClassName}
      >
        {_.map(options, option => (
          <Option key={option.key}>{option.value}</Option>
        ))}
      </Select>
      {error && (
        <p className="global__field__error-text" style={{ marginTop: "0px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

SelectField.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.any, value: PropTypes.any })
  ),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  selectFieldClassName: PropTypes.string
};

export default React.memo(SelectField);
