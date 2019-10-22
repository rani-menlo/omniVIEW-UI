import React from "react";
import PropTypes from "prop-types";
import { InputField } from "..";

const onInputText = (onChange, limit) => e => {
  const { value } = e.target;
  const reg = /^([0-9]*)?$/;
  if (!Number.isNaN(value) && reg.test(value)) {
    if (limit) {
      if (Number(value) <= limit) {
        onChange(e);
      }
    } else {
      onChange(e);
    }
  }
};

const NumericInput = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  style,
  className,
  limit,
  disabled
}) => {
  return (
    <InputField
      disabled={disabled}
      label={label}
      value={value}
      onChange={onInputText(onChange, limit)}
      placeholder={placeholder}
      error={error}
      style={style}
      className={className}
    />
  );
};

NumericInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string
};

NumericInput.defaultProps = {
  className: ""
};

export default React.memo(NumericInput);
