import React, { Component } from 'react';

import { Layout, Menu, Icon } from 'antd';

const { Header, Sider, Content } = Layout;

class SiderDemo extends Component {
  state = {
    collapsed: false
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    return (
      <div
        style={{
          display: 'flex',
          margin: '24px 16px',
          padding: 24,
          background: '#fff',
          minHeight: 280
        }}
        onClick={this.toggle}
      >
        <Sider
          width="10%"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="logo" />
        </Sider>
        <div style={{ width: '80%' }}>Content</div>
        <Sider
          width="10%"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          reverseArrow={true}
          collapsedWidth={0}
        >
          <div className="logo" />
        </Sider>
      </div>
    );
  }
}

export default SiderDemo;
