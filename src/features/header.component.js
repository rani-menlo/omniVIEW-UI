import React from "react";
import { Avatar, Icon } from "antd";

const Header = () => {
  return (
    <div className="headerbar">
      <img src='/images/omnicia-logo.svg' className="headerbar-logo" />
      <div>
        <Avatar size="small" icon="user" />
        <span className="headerbar-username">John Smith</span>
        <Icon type="down" />
      </div>
    </div>
  );
};

export default Header;
