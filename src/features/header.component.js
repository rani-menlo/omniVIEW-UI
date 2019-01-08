import React from "react";
import { Avatar } from "antd";
import OmniciaLogo from "../../assets/images/omnicia-logo.svg";

const Header = () => {
  return (
    <div className="headerbar">
      <img
        src={OmniciaLogo}
        className="headerbar-logo"
      />
      <div>
        <Avatar size="small" icon="user" />
        <span style={{marginLeft:'10px', marginRight: '10px'}}>John Smith</span>
      </div>
    </div>
  );
};

export default Header;
