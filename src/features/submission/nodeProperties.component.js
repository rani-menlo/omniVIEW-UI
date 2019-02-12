import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import _ from "lodash";
import { SERVER_URL, URI } from "../../constants";
import { TypesJson } from "./types";

class NodeProperties extends Component {
  static propTypes = {
    properties: PropTypes.object,
    sequence: PropTypes.object,
    submission: PropTypes.object,
    m1Json: PropTypes.object
  };

  getFileName = fullName => {
    return fullName.substring(fullName.lastIndexOf("/") + 1, fullName.length);
  };

  openFile = () => {
    const { properties } = this.props;
    const fileHref = properties["xlink:href"];
    const types = fileHref && fileHref.split(".");
    const type = _.get(types, "[1]", "pdf");
    if (type.includes("pdf") && properties.fileID) {
      window.open(
        `${process.env.PUBLIC_URL}/viewer/pdf/${properties.fileID}`,
        "_blank"
      );
    } else {
      properties.fileID &&
        window.open(
          `${process.env.PUBLIC_URL}/viewer/${type}/${properties.fileID}`,
          "_blank"
        );
    }
  };

  getStfProperties = () => {
    const { properties } = this.props;
    return (
      <React.Fragment>
        <Row>
          <div className="label">Study Title:</div>
          <div className="value">{properties.title || ""}</div>
        </Row>
        <Row>
          <div className="label">Study ID:</div>
          <div className="value">{properties.ID || ""}</div>
        </Row>
        <Row>
          <div className="label">Categories:</div>
        </Row>
      </React.Fragment>
    );
  };

  isSTF = () => {
    const { properties } = this.props;
    return _.get(properties, "version", "").includes("STF");
  };

  getLeafProperties = properties => {
    if (!properties.fileID) {
      return null;
    }
    return (
      <React.Fragment>
        <Row>
          <div className="label">Title:</div>
          <div className="value">{properties.title || ""}</div>
        </Row>
        <Row>
          <div className="label">File Name:</div>
          <div className="value link">
            <a onClick={this.openFile}>
              {this.getFileName(properties["xlink:href"])}
            </a>
          </div>
        </Row>
        <Row>
          <div className="label">eCTD Operation:</div>
          <div className="value">{properties.operation || ""}</div>
        </Row>
        <Row>
          <div className="label">Leaf ID:</div>
          <div className="value">{properties.ID || ""}</div>
        </Row>
        <Row>
          <div className="label">File Link(Href):</div>
          <div className="value link">
            <a onClick={this.openFile}>{properties["xlink:href"] || ""}</a>
          </div>
        </Row>
        <Row>
          <div className="label">Checksum:</div>
          <div className="value">{properties.checksum || ""}</div>
        </Row>
        <Row>
          <div className="label">Checksum type:</div>
          <div className="value">{properties["checksum-type"] || ""}</div>
        </Row>
        {properties.version && (
          <Row>
            <div className="label">version:</div>
            <div className="value">{properties.version || ""}</div>
          </Row>
        )}
        <Row>
          <div className="label">Xlink Type:</div>
          <div className="value">{properties["xlink:type"]}</div>
        </Row>
        <Row>
          <div className="label">Containing Folder:</div>
          <div className="value">{properties.folder || ""}</div>
        </Row>
        {properties.manufacturer && (
          <Row>
            <div className="label">Manufacturer:</div>
            <div className="value">{properties.manufacturer || ""}</div>
          </Row>
        )}
        {properties.substance && (
          <Row>
            <div className="label">Substance:</div>
            <div className="value">{properties.substance || ""}</div>
          </Row>
        )}
      </React.Fragment>
    );
  };

  isRootSubmission = () => {
    const { properties } = this.props;
    return _.get(properties, "[dtd-version]", "");
  };

  getRootProperties = () => {
    const { properties, m1Json } = this.props;
    const label = _.get(
      m1Json,
      "[admin][application-set][application][application-information][application-number][$t]",
      ""
    );
    const companyName = _.get(
      m1Json,
      "[admin][applicant-info][company-name]",
      ""
    );
    console.log("propserties", properties);
    console.log("label", label);
    console.log("m1json", m1Json);
    return (
      <React.Fragment>
        <Row>
          <div className="label">Name:</div>
          <div className="value">{label || ""}</div>
        </Row>
        <Row>
          <div className="label">Company:</div>
          <div className="value">{companyName || ""}</div>
        </Row>
        {/* <Row>
          <div className="label">Containing Folder:</div>
          <div className="value">{properties.folder || ""}</div>
        </Row>
        <Row>
          <div className="label">First Sequence:</div>
          <div className="value">{properties.firstSequence || ""}</div>
        </Row>
        <Row>
          <div className="label">Last Sequence:</div>
          <div className="value">{properties.lastSequence || ""}</div>
        </Row> */}
      </React.Fragment>
    );
  };

  isFolder = () => {
    const { properties } = this.props;
    return (
      !properties["dtd-version"] &&
      properties.name !== "m1-regional" &&
      !properties.fileID
    );
  };

  getFolderProperties = () => {
    const { properties } = this.props;
    return (
      <React.Fragment>
        <Row>
          <div className="label">Title:</div>
          <div className="value">{properties.title || ""}</div>
        </Row>
        <Row>
          <div className="label">Xml Tag:</div>
          <div className="value">{properties.name || ""}</div>
        </Row>
      </React.Fragment>
    );
  };

  isM1 = () => {
    const { properties } = this.props;
    return properties.name === "m1-regional";
  };

  getContacts = applicantInfo => {
    const contacts = _.get(
      applicantInfo,
      "[applicant-contacts][applicant-contact]"
    );
    return _.map(contacts, contact => {
      let text = _.get(contact, "[applicant-contact-name][$t]", "");
      let contactType = _.get(
        contact,
        "[applicant-contact-name][applicant-contact-type]",
        ""
      );
      contactType = _.find(
        _.get(TypesJson, "[applicant-contact-type]", ""),
        type => type.code === contactType
      ).display;
      text = `${text}(${contactType}), `;
      text = `${text}${_.get(contact, "[telephones][telephone][$t]", "")}`;
      let phoneType = _.get(
        contact,
        "[telephones][telephone][telephone-number-type]",
        ""
      );
      phoneType = _.find(
        _.get(TypesJson, "[telephone-number-type]", ""),
        type => type.code === phoneType
      ).display;
      text = `${text}(${phoneType}), `;
      text = `${text}${_.get(contact, "[emails][email]", "")}`;
      return text;
    });
  };

  getM1Properties = () => {
    const { m1Json, properties, sequence } = this.props;
    const m1Properties = m1Json["m1-regional-properties"];
    const applicantInfo = _.get(m1Json, "[admin][applicant-info]");
    const application = _.get(m1Json, "[admin][application-set][application]");
    const applicationNumber = _.get(
      application,
      "[application-information][application-number]"
    );
    const applicationType = _.find(
      _.get(TypesJson, "[application-type]", ""),
      type => type.code === applicationNumber["application-type"]
    ).display;
    const submissionInfo = _.get(application, "[submission-information]");
    const submissionType = _.find(
      _.get(TypesJson, "[submission-type]", ""),
      type =>
        type.code ===
        _.get(submissionInfo, "[submission-id][submission-type]", "")
    ).display;
    return (
      <React.Fragment>
        <Row>
          <div className="label">Title:</div>
          <div className="value">{properties.title || ""}</div>
        </Row>
        <Row>
          <div className="label">Index Type:</div>
          <div className="value">{_.get(m1Properties, "title", "")}</div>
        </Row>
        <Row>
          <div className="label">Submission Description:</div>
          <div className="value">
            {_.get(applicantInfo, "[submission-description]", "")}
          </div>
        </Row>
        <Row>
          <div className="label">Company Name:</div>
          <div className="value">
            {_.get(applicantInfo, "[company-name]", "")}
          </div>
        </Row>
        <Row>
          <div className="label">Company ID:</div>
          <div className="value">{_.get(applicantInfo, "id", "")}</div>
        </Row>
        <div className="global__hr-line" style={{ background: "#bfc4c7" }} />
        {_.map(this.getContacts(applicantInfo), contact => {
          return (
            <Row key={contact}>
              <div className="label">Applicant Contact:</div>
              <div className="value">{contact}</div>
            </Row>
          );
        })}
        <div className="global__hr-line" style={{ background: "#bfc4c7" }} />
        <Row>
          <div className="label">Application Number:</div>
          <div className="value">{_.get(applicationNumber, "[$t]", "")}</div>
        </Row>
        <Row>
          <div className="label">Application Type:</div>
          <div className="value">{applicationType}</div>
        </Row>
        <Row>
          <div className="label">Cross Reference Application Number(s): </div>
          <div className="value">{_.get(applicationNumber, "cr", "")}</div>
        </Row>
        <Row>
          <div className="label">Submission ID: </div>
          <div className="value">
            {_.get(submissionInfo, "[submission-id][$t]", "")}
          </div>
        </Row>
        <Row>
          <div className="label">Submission Type: </div>
          <div className="value">{submissionType}</div>
        </Row>
        <Row>
          <div className="label">Supplement Effective Date Type: </div>
          <div className="value">{_.get(submissionInfo, "date", "")}</div>
        </Row>
        <Row>
          <div className="label">Date Type: </div>
          <div className="value">{_.get(submissionInfo, "date", "")}</div>
        </Row>
        <Row>
          <div className="label">Sequence Number: </div>
          <div className="value">
            {_.get(submissionInfo, "[sequence-number][$t]", "")}
          </div>
        </Row>
        <Row>
          <div className="label">Submission Sub-Type: </div>
          <div className="value">
            {_.get(sequence, "[submission_sub_type]", "")}
          </div>
        </Row>
        <Row>
          <div className="label">Form: </div>
          <div className="value">{_.get(submissionInfo, "", "")}</div>
        </Row>
      </React.Fragment>
    );
  };

  getLifeCycleId = lifeCycle => {
    const { submission } = this.props;
    return `${_.get(submission, "name", "")}\\${lifeCycle.sequence} : ${
      lifeCycle.ID
    }`;
  };

  getModifiedFile = lifeCycle => {
    const { submission } = this.props;
    const modified = lifeCycle["modified-file"] || "";
    const splits = _.split(modified, "/");
    const sequence = _.get(splits, "[1]", "");
    let id = _.get(splits, "[2]", "");
    id = _.split(id, "#");
    id = _.get(id, "[1]", "");

    return modified
      ? `${_.get(submission, "name", "")}\\${sequence} : ${id}`
      : "";
  };

  render() {
    const { properties, m1Json } = this.props;
    return (
      properties && (
        <div className="properties">
          <div className="properties__table">
            {this.isRootSubmission() && this.getRootProperties()}
            {this.isFolder() && this.getFolderProperties()}
            {this.isSTF() && this.getStfProperties()}
            {this.isM1() && this.getM1Properties()}
            {(this.isSTF() || this.isM1()) && (
              <div className="section-title">Leaf Properties</div>
            )}
            {this.getLeafProperties(
              this.isM1() ? m1Json["m1-regional-properties"] : properties
            )}
          </div>
          {_.get(properties, "lifeCycles.length", "") && (
            <React.Fragment>
              <span className="properties-life-cycle-title">
                {this.isSTF() ? "STF Life Cycle" : "Document Life Cycle"}
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
                          {this.getLifeCycleId(lifeCycle)}
                        </td>
                        <td>{lifeCycle.operation}</td>
                        <td className="properties__life-cycle-table-link">
                          {this.getModifiedFile(lifeCycle)}
                        </td>
                        <td className="properties__life-cycle-table-link link">
                          <a onClick={this.openFile}>
                            {this.getFileName(lifeCycle["xlink:href"])}
                          </a>
                        </td>
                        <td>{properties.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </React.Fragment>
          )}
        </div>
      )
    );
  }
}

const Row = styled.div`
  display: flex;
  padding: 4px 0px;
  padding-left: 30px;
`;

export default NodeProperties;
