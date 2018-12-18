import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

class NodeProperties extends Component {
  static propTypes = {
    properties: PropTypes.object
  };

  render() {
    const { properties } = this.props;
    return (
      <table className="properties_table">
        <tbody>
          {/* {_.map(properties, (value, key) => (
            <tr key={key}>
              <td className="label">{key}:</td>
              <td className="value">{value}</td>
            </tr>
          ))} */}
          {properties.title && (
            <tr>
              <td className="label">Title:</td>
              <td className="value">{properties.title}</td>
            </tr>
          )}
          {properties.title && (
            <tr>
              <td className="label">File Name:</td>
              <td className="value link">{properties.title}</td>
            </tr>
          )}
          {properties.operation && (
            <tr>
              <td className="label">eCTD Operation:</td>
              <td className="value">{properties.operation}</td>
            </tr>
          )}
          {properties.ID && (
            <tr>
              <td className="label">Leaf ID:</td>
              <td className="value">{properties.ID}</td>
            </tr>
          )}
          {properties.href && (
            <tr>
              <td className="label">File Link(Href):</td>
              <td className="value link">
                <a
                  target="_blank"
                  href="http://www.africau.edu/images/default/sample.pdf"
                >
                  {properties.href}
                </a>
              </td>
            </tr>
          )}
          {properties.checksum && (
            <tr>
              <td className="label">Checksum:</td>
              <td className="value">{properties.checksum}</td>
            </tr>
          )}
          {properties['checksum-type'] && (
            <tr>
              <td className="label">Checksum type:</td>
              <td className="value">{properties['checksum-type']}</td>
            </tr>
          )}
          {properties.type && (
            <tr>
              <td className="label">Xlink Type:</td>
              <td className="value">{properties.type}</td>
            </tr>
          )}
          {properties.manufacturer && (
            <tr>
              <td className="label">Manufacturer:</td>
              <td className="value">{properties.manufacturer}</td>
            </tr>
          )}
          {properties.substance && (
            <tr>
              <td className="label">Substance:</td>
              <td className="value">{properties.substance}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default NodeProperties;
