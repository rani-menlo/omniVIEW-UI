import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const SubHeader = ({ children, className }) => {
  return <Container className={className}>{children}</Container>;
};

SubHeader.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  className: PropTypes.string
};

SubHeader.defaultProps = {
  className: ""
};

const Container = styled.div`
  display: flex;
  padding: 8px 15%;
  background: #fff;
  align-items: center;
  height: 55px;
`;

export default React.memo(SubHeader);
