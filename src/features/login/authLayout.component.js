import React from "react";
import PropTypes from "prop-types";

const AuthLayout = ({ heading, children }) => {
  return (
    <div className="global__container">
      <div className="authlayout">
        <p className="authlayout-login">Login</p>
        <div className="authlayout__text">{heading}</div>
        {children}
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  heading: PropTypes.string
};

export default AuthLayout;
