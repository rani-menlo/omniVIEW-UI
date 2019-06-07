import React, { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const Image = styled.img`
  background-size: cover;
  display: block;
  border-radius: 100px;
`;

const CircularLocalImageFile = ({ file, className }) => {
  if (!file || typeof file === 'string') {
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

CircularLocalImageFile.propTypes = {
  file: PropTypes.object
};

CircularLocalImageFile.defaultProps = {
  file: null
};

export default React.memo(CircularLocalImageFile);
