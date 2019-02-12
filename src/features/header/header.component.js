import React from "react";
import ProfileMenu from "./profileMenu.component";

const Header = () => {
  return (
    <div className="headerbar">
      <img src="/images/omnicia-logo.svg" className="headerbar-logo" />
      <div>
        <ProfileMenu />
      </div>
    </div>
  );
};

export default Header;
