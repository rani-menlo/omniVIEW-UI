import React, { Component } from 'react';
import { Form, Input, Button } from 'antd';
import PropTypes from 'prop-types';
import _ from 'lodash';

const FormItem = Form.Item;

const data = {
  name: 'react-treebeard',
  toggled: false,
  children: [
    {
      name: 'example',
      children: [
        {
          name: 'app.js',
          active: false
        },
        {
          name: 'data.js',
          active: false
        },
        {
          name: 'index.html',
          active: false
        },
        {
          name: 'styles.js',
          active: false
        },
        {
          name: 'webpack.config.js',
          active: false
        }
      ],
      active: false,
      toggled: true
    },
    {
      name: 'node_modules',
      loading: true,
      children: [],
      active: false,
      toggled: true
    },
    {
      name: 'src',
      children: [
        {
          name: 'components',
          children: [
            {
              name: 'decorators.js'
            },
            {
              name: 'treebeard.js'
            }
          ]
        },
        {
          name: 'index.js'
        }
      ]
    },
    {
      name: 'themes',
      children: [
        {
          name: 'animations.js'
        },
        {
          name: 'default.js'
        }
      ],
      active: false,
      toggled: false
    },
    {
      name: 'Gulpfile.js'
    },
    {
      name: 'index.js'
    },
    {
      name: 'package.json'
    }
  ],
  active: true
};

class Login extends Component {
  static propTypes = {
    form: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = { data };
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        alert(values); // eslint-disable-line no-alert
      }
    });
  };

  onToggle = (node, toggled) => {
    if (this.state.cursor) {
      this.state.cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    this.setState({ cursor: node });
  };

  children = (children, toggle) => {
    _.forEach(children, child => this.set(child, toggle));
  };

  set = (child, toggle) => {
    child.toggled = toggle;
    if (child.children) {
      this.children(child.children, toggle);
    }
  };

  expand = () => {
    const data = { ...this.state.data };
    this.set(data, true);
    this.setState({ data });
  };

  collapse = () => {
    const data = { ...this.state.data };
    this.set(data, false);
    this.setState({ data });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {getFieldDecorator('userName', {
              rules: [
                { required: true, message: 'Please input your username!' }
              ]
            })(<Input placeholder="Username" />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: 'Please input your Password!' }
              ]
            })(<Input type="password" placeholder="Password" />)}
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedLoginForm = Form.create()(Login);

export default WrappedLoginForm;
