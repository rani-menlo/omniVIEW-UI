import React from "react";
import PropTypes from "prop-types";

const Text = ({
  text,
  type,
  size,
  opacity,
  className,
  textStyle,
  onClick,
  onDoubleClick
}) => {
  return (
    <p
      className={`heebo_text-${type} ${className}`}
      style={{ fontSize: size, opacity, ...textStyle }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {text}
    </p>
  );
};

Text.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.oneOf(["regular", "medium", "bold", "extra_bold"]),
  size: PropTypes.string,
  opacity: PropTypes.number,
  className: PropTypes.string,
  textStyle: PropTypes.object,
  onClick: PropTypes.func
};

Text.deafultProps = {
  text: "",
  type: "regular"
};

export default Text;
