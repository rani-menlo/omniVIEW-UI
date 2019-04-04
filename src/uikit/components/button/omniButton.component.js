import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";

const OmniButton = ({ label, onClick, className, type, buttonStyle }) => {
  if (type === "add") {
    return (
      <span
        className={`omniButton-add ${className}`}
        onClick={onClick}
        style={buttonStyle}
      >
        <img src="/images/plus.svg" />
        <span className="omniButton-add-text">{label}</span>
      </span>
    );
  }
  return (
    <Button
      style={buttonStyle}
      type={type}
      className={`omniButton-${type} ${className}`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

OmniButton.propTypes = {
  type: PropTypes.oneOf(["add", "primary", "secondary"]),
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  buttonStyle: PropTypes.object
};

OmniButton.defaultProps = {
  type: "primary",
  className: ""
};

export default React.memo(OmniButton);
