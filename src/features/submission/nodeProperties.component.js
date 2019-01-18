import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { SERVER_URL, URI } from "../../constants";

class NodeProperties extends Component {
  static propTypes = {
    properties: PropTypes.object
  };

  getFileName = fullName => {
    return fullName.substring(fullName.lastIndexOf("/") + 1, fullName.length);
  };

  openFile = () => {};

  render() {
    const { properties } = this.props;
    return (
      <div className="properties">
        <table className="properties__table">
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
            {properties.fileID && (
              <tr>
                <td className="label">File Link(Href):</td>
                <td className="value link">
                  <a
                    target="_blank"
                    href={`${SERVER_URL}${URI.GET_RESOURCE_FILE}/${
                      properties.fileID
                    }`}
                  >
                    {properties.title}
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
            {properties["checksum-type"] && (
              <tr>
                <td className="label">Checksum type:</td>
                <td className="value">{properties["checksum-type"]}</td>
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
        {_.get(properties, "lifeCycles.length", "") && (
          <React.Fragment>
            <span className="properties-life-cycle-title">
              Document Life Cycle
            </span>
            <div className="properties__life-cycle-table">
              <table>
                <thead>
                  <tr>
                    <th>Leaf ID</th>
                    <th>Operation</th>
                    <th>Modified File</th>
                    <th>File Name</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {_.map(properties.lifeCycles, lifeCycle => (
                    <tr>
                      <td className="properties__life-cycle-table-link">
                        {lifeCycle.ID}
                      </td>
                      <td>{lifeCycle.operation}</td>
                      <td>{lifeCycle.modified || ""}</td>
                      <td className="properties__life-cycle-table-link link">
                        <a
                          target="_blank"
                          href={`${SERVER_URL}${URI.GET_RESOURCE_FILE}/${
                            properties.fileID
                          }`}
                        >
                          {this.getFileName(lifeCycle["xlink:href"])}
                        </a>
                      </td>
                      <td>{this.getFileName(lifeCycle["xlink:href"])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default NodeProperties;
