import React from "react";
import PropTypes from "prop-types";
import { translate } from "../../translations/translator";

const AuthLayout = ({ title, heading, children, authLayoutStyle }) => {
  return (
    <div className="global__container">
      <div className="authlayout" style={authLayoutStyle}>
        <p className="authlayout-login">
          {title || translate("text.login.title")}
        </p>
        {heading && <div className="authlayout__text">{heading}</div>}
        {children}
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  heading: PropTypes.string
};

export default AuthLayout;
