import React from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import ProfileMenu from "./profileMenu.component";

const goToMain = history => () => {
  history.push("/customers");
};
const Header = ({ style, history }) => {
  return (
    <div className="headerbar" style={style}>
      <img
        src="/images/omnicia-logo.svg"
        className="headerbar-logo"
        onClick={goToMain(history)}
      />
      <div>
        <ProfileMenu />
      </div>
    </div>
  );
};

Header.propTypes = {
  style: PropTypes.object
};

export default React.memo(withRouter(Header));
