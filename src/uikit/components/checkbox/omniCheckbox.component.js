import React from "react";
import PropTypes from "prop-types";
import { Checkbox } from "antd";

const OmniCheckbox = ({ style, onCheckboxChange, checked }) => {
  return (
    <Checkbox
      className="omniCheckbox"
      style={style}
      onChange={onCheckboxChange}
      checked={checked}
    />
  );
};

OmniCheckbox.propTypes = {
  style: PropTypes.object,
  onCheckboxChange: PropTypes.func,
  checked: PropTypes.bool
};

export default OmniCheckbox;
