import React from 'react';
import { Avatar } from 'antd';

const Header = () => {
  return (
    <div className="headerbar">
      <img src='/images/omnicia-logo.svg' className="headerbar-logo" />
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
