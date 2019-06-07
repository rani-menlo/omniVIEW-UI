import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";

const OmniButton = ({
  label,
  onClick,
  className,
  type,
  buttonStyle,
  disabled,
  image
}) => {
  if (type === "add") {
    return (
      <span
        className={`omniButton-add ${className}`}
        onClick={onClick}
        style={buttonStyle}
      >
        {image || <img src="/images/plus.svg" />}
        <span className="omniButton-add-text">{label}</span>
      </span>
    );
  }
  return (
    <Button
      style={{ ...buttonStyle, opacity: disabled ? 0.2 : 1 }}
      disabled={disabled}
      type={type}
      className={`omniButton-${type} ${className}`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

OmniButton.propTypes = {
  type: PropTypes.oneOf(["add", "primary", "secondary", "danger"]),
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  buttonStyle: PropTypes.object,
  disabled: PropTypes.bool,
  image: PropTypes.node
};

OmniButton.defaultProps = {
  type: "primary",
  className: ""
};

export default React.memo(OmniButton);
