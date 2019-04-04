import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import _ from "lodash";
import { SERVER_URL, URI } from "../../constants";
import { TypesJson } from "./types";
import Row from "../../uikit/components/row/row.component";

class NodeProperties extends Component {
  static propTypes = {
    properties: PropTypes.object,
    sequence: PropTypes.object,
    submission: PropTypes.object,
    m1Json: PropTypes.object,
    view: PropTypes.oneOf(["current", "lifeCycle"])
  };

  getFileName = fullName => {
    return fullName.substring(fullName.lastIndexOf("/") + 1, fullName.length);
  };

  openFile = () => {
    const { properties } = this.props;
    const fileHref = properties["xlink:href"];
    /* const types = fileHref && fileHref.split(".");
    const type = _.get(types, "[1]", "pdf"); */
    const type = fileHref.substring(fileHref.lastIndexOf(".") + 1);
    let newWindow = null;
    if (type.includes("pdf") && properties.fileID) {
      newWindow = window.open(
        `${process.env.PUBLIC_URL}/viewer/pdf/${properties.fileID}`,
        "_blank"
      );
    } else {
      if (properties.fileID) {
        newWindow = window.open(
          `${process.env.PUBLIC_URL}/viewer/${type}/${properties.fileID}`,
          "_blank"
        );
      }
    }

    if (newWindow) {
      newWindow.addEventListener("load", function() {
        newWindow.document.title = _.get(properties, "title", "");
      });
    }
  };

  getStfProperties = () => {
    const { properties } = this.props;
    return (
      <React.Fragment>
        <RowItems>
          <div className="label">Study Title:</div>
          <div className="value">{properties.title || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Study ID:</div>
          <div className="value">{properties.ID || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Categories:</div>
        </RowItems>
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
        <RowItems>
          <div className="label">Title:</div>
          <div className="value">{properties.title || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">File Name:</div>
          <div className="value link">
            <a onClick={this.openFile}>
              {this.getFileName(properties["xlink:href"])}
            </a>
          </div>
        </RowItems>
        <RowItems>
          <div className="label">eCTD Operation:</div>
          <div className="value">{properties.operation || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Leaf ID:</div>
          <div className="value">{properties.ID || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">File Link(Href):</div>
          <div className="value link">
            <a onClick={this.openFile}>{properties["xlink:href"] || ""}</a>
          </div>
        </RowItems>
        <RowItems>
          <div className="label">Checksum:</div>
          <div className="value">{properties.checksum || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Checksum type:</div>
          <div className="value">{properties["checksum-type"] || ""}</div>
        </RowItems>
        {properties.version && (
          <RowItems>
            <div className="label">version:</div>
            <div className="value">{properties.version || ""}</div>
          </RowItems>
        )}
        <RowItems>
          <div className="label">Xlink Type:</div>
          <div className="value">{properties["xlink:type"]}</div>
        </RowItems>
        <RowItems>
          <div className="label">Containing Folder:</div>
          <div className="value">{properties.folder || ""}</div>
        </RowItems>
        {properties.manufacturer && (
          <RowItems>
            <div className="label">Manufacturer:</div>
            <div className="value">{properties.manufacturer || ""}</div>
          </RowItems>
        )}
        {properties.substance && (
          <RowItems>
            <div className="label">Substance:</div>
            <div className="value">{properties.substance || ""}</div>
          </RowItems>
        )}
      </React.Fragment>
    );
  };

  isRootSubmission = () => {
    const { properties } = this.props;
    return _.get(properties, "[dtd-version]", "");
  };

  isRootSequence = () => {
    const { properties } = this.props;
    return this.isRootSubmission() && properties.isSequence;
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
    return (
      <React.Fragment>
        <RowItems>
          <div className="label">Name:</div>
          <div className="value">{label || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Company:</div>
          <div className="value">{companyName || ""}</div>
        </RowItems>
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

  getTitle = (title = "") => {
    const idx = title.indexOf("(");
    if (idx === -1) {
      return title;
    }
    return title.substring(0, idx);
  };

  getFolderProperties = () => {
    const { properties } = this.props;
    return (
      <React.Fragment>
        <RowItems>
          <div className="label">Title:</div>
          <div className="value">{this.getTitle(properties.title)}</div>
        </RowItems>
        <RowItems>
          <div className="label">Xml Tag:</div>
          <div className="value">{properties.name || ""}</div>
        </RowItems>
        {properties["formType"] && (
          <RowItems>
            <div className="label">Form Type:</div>
            <div className="value">{properties.formType || ""}</div>
          </RowItems>
        )}
        {properties.dosageform && (
          <RowItems>
            <div className="label">Dosage Form:</div>
            <div className="value">{properties.dosageform || ""}</div>
          </RowItems>
        )}
        {properties.manufacturer && (
          <RowItems>
            <div className="label">Manufacturer:</div>
            <div className="value">{properties.manufacturer || ""}</div>
          </RowItems>
        )}
        {properties["product-name"] && (
          <RowItems>
            <div className="label">Product Name:</div>
            <div className="value">{properties["product-name"] || ""}</div>
          </RowItems>
        )}
        {properties.substance && (
          <RowItems>
            <div className="label">Substance:</div>
            <div className="value">{properties.substance || ""}</div>
          </RowItems>
        )}
        {properties.excipient && (
          <RowItems>
            <div className="label">Excipient:</div>
            <div className="value">{properties.excipient || ""}</div>
          </RowItems>
        )}
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
      );
      text = `${text}(${_.get(contactType, "display", "")}), `;
      text = `${text}${_.get(contact, "[telephones][telephone][$t]", "")}`;
      let phoneType = _.get(
        contact,
        "[telephones][telephone][telephone-number-type]",
        ""
      );
      phoneType = _.find(
        _.get(TypesJson, "[telephone-number-type]", ""),
        type => type.code === phoneType
      );
      text = `${text}(${_.get(phoneType, "display", "")}), `;
      text = `${text}${_.get(contact, "[emails][email]", "")}`;
      return text;
    });
  };

  getM1Properties = () => {
    const { m1Json, properties, sequence, view } = this.props;
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
        {!this.isRootSequence() && (
          <RowItems>
            <div className="label">Title:</div>
            <div className="value">{properties.title || ""}</div>
          </RowItems>
        )}
        {!this.isRootSequence() && (
          <RowItems>
            <div className="label">Index Type:</div>
            <div className="value">{_.get(m1Properties, "title", "")}</div>
          </RowItems>
        )}
        <RowItems>
          <div className="label">Submission Description:</div>
          <div className="value">
            {_.get(applicantInfo, "[submission-description]", "")}
          </div>
        </RowItems>
        <RowItems>
          <div className="label">Company Name:</div>
          <div className="value">
            {_.get(applicantInfo, "[company-name]", "")}
          </div>
        </RowItems>
        <RowItems>
          <div className="label">Company ID:</div>
          <div className="value">{_.get(applicantInfo, "id", "")}</div>
        </RowItems>
        <div className="global__hr-line" style={{ background: "#bfc4c7" }} />
        {_.map(this.getContacts(applicantInfo), contact => {
          return (
            <RowItems key={contact}>
              <div className="label">Applicant Contact:</div>
              <div className="value">{contact}</div>
            </RowItems>
          );
        })}
        <div className="global__hr-line" style={{ background: "#bfc4c7" }} />
        <RowItems>
          <div className="label">Application Number:</div>
          <div className="value">{_.get(applicationNumber, "[$t]", "")}</div>
        </RowItems>
        <RowItems>
          <div className="label">Application Type:</div>
          <div className="value">{applicationType}</div>
        </RowItems>
        <RowItems>
          <div className="label">Cross Reference Application Number(s): </div>
          <div className="value">{_.get(applicationNumber, "cr", "")}</div>
        </RowItems>
        <RowItems>
          <div className="label">Submission ID: </div>
          <div className="value">
            {_.get(submissionInfo, "[submission-id][$t]", "")}
          </div>
        </RowItems>
        <RowItems>
          <div className="label">Submission Type: </div>
          <div className="value">{submissionType}</div>
        </RowItems>
        <RowItems>
          <div className="label">Supplement Effective Date Type: </div>
          <div className="value">{_.get(submissionInfo, "date", "")}</div>
        </RowItems>
        <RowItems>
          <div className="label">Date Type: </div>
          <div className="value">{_.get(submissionInfo, "date", "")}</div>
        </RowItems>
        <RowItems>
          <div className="label">Sequence Number: </div>
          <div className="value">
            {view === ""
              ? _.get(submissionInfo, "[sequence-number][$t]", "")
              : _.get(submissionInfo, "[submission-id][$t]", "")}
          </div>
        </RowItems>
        <RowItems>
          <div className="label">Submission Sub-Type: </div>
          <div className="value">
            {_.get(sequence, "[submission_sub_type]", "")}
          </div>
        </RowItems>
        <RowItems>
          <div className="label">Form: </div>
          <div className="value">{_.get(submissionInfo, "", "")}</div>
        </RowItems>
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
            {this.isRootSequence() && (
              <React.Fragment>
                <div className="section-title">M1 Properties</div>
                {this.getM1Properties()}
              </React.Fragment>
            )}
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
                    {_.map(properties.lifeCycles, (lifeCycle, idx) => (
                      <tr key={idx}>
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

const RowItems = styled(Row)`
  padding: 4px 0px;
  padding-left: 30px;
  justify-content: normal;
  align-items: normal;
`;

export default NodeProperties;
