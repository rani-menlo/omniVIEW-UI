import React from "react";
import PropTypes from "prop-types";
import FormItem from "antd/lib/form/FormItem";
import { Input } from "antd";

const onInputText = (onChange, allowSpaces) => e => {
  const { value } = e.target;
  if (value.includes(" ") && !allowSpaces) {
    return;
  }
  onChange && onChange(e);
};

const InputField = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  error,
  style,
  className,
  disabled,
  allowSpaces
}) => {
  return (
    <div style={style} className={className}>
      {label && <p className="global__field-label">{label}</p>}
      <FormItem>
        {type === "password" ? (
          <Input
            type="password"
            disabled={disabled}
            placeholder={placeholder}
            onChange={onInputText(onChange)}
            value={value}
            className={error && "global__field__error-box"}
          />
        ) : (
          <Input
            disabled={disabled}
            placeholder={placeholder}
            onChange={onInputText(onChange, allowSpaces)}
            value={value}
            className={error && "global__field__error-box"}
          />
        )}
      </FormItem>
      {error && <p className="global__field__error-text">{error}</p>}
    </div>
  );
};

InputField.propTypes = {
  type: PropTypes.oneOf(["password", ""]),
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  allowSpaces: PropTypes.bool
};

InputField.defaultProps = {
  type: "",
  className: ""
};

export default React.memo(InputField);
