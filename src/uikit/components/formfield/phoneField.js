import React from "react";
import PropTypes from "prop-types";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

const PhoneField = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  style,
  className,
  disabled
}) => {
  return (
    <div style={style} className={className}>
      {label && (
        <p className="global__field-label omniField-phone-label">{label}</p>
      )}
      <PhoneInput
        disabled={disabled}
        country={"US"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`omniField-phone ${error && "global__field__error-box"}`}
      />
      {error && (
        <p className="global__field__error-text" style={{ marginTop: "0px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

PhoneField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default React.memo(PhoneField);
