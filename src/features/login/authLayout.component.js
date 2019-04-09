import React from "react";
import PropTypes from "prop-types";
import { translate } from "../../translations/translator";

const AuthLayout = ({ heading, children }) => {
  return (
    <div className="global__container">
      <div className="authlayout">
        <p className="authlayout-login">{translate("text.login.title")}</p>
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
