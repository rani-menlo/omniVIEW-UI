import React from "react";
import PropTypes from "prop-types";

const Text = ({ text, type, size, opacity, className, textStyle }) => {
  return (
    <p
      className={`heebo_text-${type} ${className}`}
      style={{ fontSize: size, opacity, ...textStyle }}
    >
      {text}
    </p>
  );
};

Text.propTypes = {
  text: PropTypes.string,
  type: PropTypes.oneOf(["regular", "medium", "bold", "extra_bold"]),
  size: PropTypes.string,
  opacity: PropTypes.number,
  className: PropTypes.string,
  textStyle: PropTypes.object
};

Text.deafultProps = {
  text: "",
  type: "regular"
};

export default Text;
