import React, { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const Image = styled.img`
  background-size: cover;
  display: block;
  border-radius: 100px;
`;

const CircularImage = ({ file, className }) => {
  if (!file) {
    return null;
  }
  const [fileData, setFileData] = useState("");
  const reader = new FileReader();
  reader.onload = e => {
    setFileData(e.target.result);
  };
  reader.readAsDataURL(file);
  return (
    <Image
      style={{
        backgroundImage: `url(${fileData})`
      }}
      className={className}
    />
  );
};

CircularImage.propTypes = {
  file: PropTypes.object
};

CircularImage.defaultProps = {
  file: null
};

export default React.memo(CircularImage);
