import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';

const Loader = ({ loading }) => {
  if (!loading) {
    return null;
  }
  return (
    <div className="loader">
      <Spin size="large" />
    </div>
  );
};

Loader.propTypes = {
  loading: PropTypes.bool
};

Loader.defaultProps = {
  loading: false
};

export default Loader;
