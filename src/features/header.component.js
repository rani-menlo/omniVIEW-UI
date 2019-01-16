import React from 'react';
import { Avatar } from 'antd';
import OmniciaLogo from '../../public/images/omnicia-logo.png';

const Header = () => {
  return (
    <div className="headerbar">
      <img src={OmniciaLogo} className="headerbar-logo" />
      <div>
        <Avatar size="small" icon="user" />
        <span style={{ marginLeft: '10px', marginRight: '10px' }}>
          John Smith
        </span>
      </div>
    </div>
  );
};

export default Header;
