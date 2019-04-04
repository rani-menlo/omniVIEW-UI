import React from "react";
import PropTypes from "prop-types";
import FormItem from "antd/lib/form/FormItem";
import { Input } from "antd";

const onInputText = onChange => e => {
  const { value } = e.target;
  if (value === " ") {
    return;
  }
  onChange && onChange(e);
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  style,
  className
}) => {
  return (
    <div style={style} className={className}>
      {label && <p className="global__field-label">{label}</p>}
      <FormItem>
        <Input
          placeholder={placeholder}
          onChange={onInputText(onChange)}
          value={value}
          className={error && "global__field__error-box"}
        />
      </FormItem>
      {error && <p className="global__field__error-text">{error}</p>}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string
};

InputField.defaultProps = {
  className: ""
};

export default React.memo(InputField);
