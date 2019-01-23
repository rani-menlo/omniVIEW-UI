import React from "react";
import { Avatar, Icon } from "antd";
import OmniciaLogo from "../../assets/images/omnicia-logo.svg";

const Header = () => {
  return (
    <div className="headerbar">
      <img src={OmniciaLogo} className="headerbar-logo" />
      <div>
        <Avatar size="small" icon="user" />
        <span className="headerbar-username">John Smith</span>
        <Icon type="down" />
      </div>
    </div>
  );
};

export default Header;
