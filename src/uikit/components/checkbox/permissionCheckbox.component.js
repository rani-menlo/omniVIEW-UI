import React from "react";
import { Checkbox } from "antd";

const PermissionCheckbox = ({
  style,
  value,
  onChange,
  className,
  disabled
}) => {
  let checked = false;
  let indeterminate = false;
  if (value === 1) {
    checked = true;
  }
  if (value === -1) {
    indeterminate = true;
  }
  return (
    <Checkbox
      disabled={disabled}
      className={`permissionCheckbox ${className}`}
      style={style}
      checked={checked}
      indeterminate={indeterminate}
      onChange={onChange}
    />
  );
};

export default PermissionCheckbox;
