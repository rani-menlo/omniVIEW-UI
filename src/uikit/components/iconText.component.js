import React from "react";
import { Text } from ".";

const IconText = ({
  text,
  image,
  onClick,
  containerStyle,
  imageStyle,
  textStyle
}) => {
  return (
    <div
      onClick={onClick}
      className="global__cursor-pointer"
      style={containerStyle}
    >
      <Text
        type="extra_bold"
        opacity={0.5}
        textStyle={{ marginRight: "4px", display: "inline", ...textStyle }}
        size="14px"
        text={text}
      />
      <img src={image} style={imageStyle} />
    </div>
  );
};

export default IconText;
