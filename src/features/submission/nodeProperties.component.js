import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import styled from "styled-components";
import _ from "lodash";
import { TypesJson } from "./types";
import Row from "../../uikit/components/row/row.component";
import {
  isLoggedInAuthor,
  isLoggedInOmniciaAdmin,
  isLoggedInCustomerAdmin,
  getOrderedSequences
} from "../../utils";
import { Text } from "../../uikit/components";
import { Icon } from "antd";

class NodeProperties extends Component {
  static propTypes = {
    properties: PropTypes.object,
    sequence: PropTypes.object,
    submission: PropTypes.object,
    m1Json: PropTypes.object,
    projectJson: PropTypes.object,
    view: PropTypes.oneOf(["current", "lifeCycle"]),
    mode: PropTypes.oneOf(["standard", "qc"]),
    formFile: PropTypes.array
  };

  getFileName = fullName => {
    return fullName.substring(fullName.lastIndexOf("/") + 1, fullName.length);
  };

  getFileTypeIcon = fileName => {
    if (!fileName) {
      return null;
    }
    if (fileName === "folder") {
      return (
        <Icon
          type="folder"
          theme="filled"
          className="global__file-folder"
          style={{ marginRight: "8px" }}
        />
      );
    }
    const ext = fileName.substring(fileName.lastIndexOf(".") + 1);
    let src = "";
    if (ext === "pdf") {
      src = "filetype-pdf.svg";
    } else if (ext === "doc" || ext === "docx") {
      src = "filetype-docx.svg";
    } else if (ext === "xpt") {
      src = "filetype-xpt.svg";
    } else {
      src = "file-attachment.svg";
    }
    return <img src={`/images/${src}`} style={{ marginRight: "8px" }} />;
  };

  loadFile = (fileHref, fileID, title) => {
    const type = fileHref.substring(fileHref.lastIndexOf(".") + 1);
    let newWindow = null;
    if (type.includes("pdf") && fileID) {
      newWindow = window.open(
        `${process.env.PUBLIC_URL}/viewer/pdf/${fileID}`,
        "_blank"
      );
    } else {
      if (fileID) {
        newWindow = window.open(
          `${process.env.PUBLIC_URL}/viewer/${type}/${fileID}`,
          "_blank"
        );
      }
    }

    if (newWindow) {
      newWindow.addEventListener("load", function() {
        newWindow.document.title = title || "";
      });
    }
  };

  openFile = () => {
    const { properties } = this.props;
    const fileHref = properties["xlink:href"];
    this.loadFile(fileHref, properties.fileID, properties.title);
  };

  openLifeCycleFile = lifeCycle => () => {
    const fileHref = lifeCycle["xlink:href"];
    this.loadFile(fileHref, lifeCycle.fileID, lifeCycle.title);
  };

  openFormFile = file => () => {
    const fileHref = file["xlink:href"];
    this.loadFile(fileHref, file.fileID, file.title);
  };

  getStfProperties = () => {
    const {
      properties,
      mode,
      submission,
      lifeCycles: lifeCycleData
    } = this.props;
    let lifeCycles = _.intersectionWith(
      lifeCycleData,
      [properties.ID],
      (a, b) => {
        return _.intersectionWith(a, [b], (a, b) => a.ID === b).length > 0;
      }
    );
    return (
      <React.Fragment>
        <RowItems>
          <div className="label">Study Title:</div>
          <div className="value">{properties["study-title"] || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Study ID:</div>
          <div className="value">{properties["study-id"] || ""}</div>
        </RowItems>
        {mode === "qc" && (
          <RowItems>
            <div className="label">Categories:</div>
            <div className="value">
              <table>
                {_.map(properties["study-categories"], (studyCateg, idx) => {
                  return _.map(studyCateg, category => {
                    return (
                      <tr key={idx}>
                        <td style={{ paddingRight: "10px" }}>
                          <Text
                            type="regular"
                            size="12px"
                            text={category.name || ""}
                          />
                        </td>
                        <td style={{ paddingRight: "10px" }}>
                          <Text
                            type="regular"
                            size="12px"
                            text={`[${category["info-type"]}]`}
                          />
                        </td>
                        <td style={{ paddingRight: "10px" }}>
                          <Text
                            type="regular"
                            size="12px"
                            text={category.value || ""}
                          />
                        </td>
                      </tr>
                    );
                  });
                })}
              </table>
            </div>
          </RowItems>
        )}
        {mode === "standard" && (
          <React.Fragment>
            <span className="properties-life-cycle-title">Aggregated STFs</span>
            <div className="properties__life-cycle-table">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Leaf ID</th>
                    <th>Operation</th>
                    <th>Modified File</th>
                  </tr>
                </thead>
                <tbody>
                  {_.map(lifeCycles[0], (lifeCycle, idx) => (
                    <tr key={idx}>
                      <td className="properties__life-cycle-table-link">
                        <a
                          onClick={
                            _.get(lifeCycle, "operation", "") === "delete"
                              ? ""
                              : this.openFile
                          }
                        >
                          {this.getFileName(lifeCycle["xlink:href"])}
                        </a>
                      </td>
                      <td className="properties__life-cycle-table-link">
                        {this.getLifeCycleId(lifeCycle)}
                      </td>
                      <td>{lifeCycle.operation}</td>
                      <td className="properties__life-cycle-table-link">
                        {this.getModifiedFile(lifeCycle)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <span
              className="properties-life-cycle-title"
              style={{ marginTop: "none" }}
            >
              Study Categories
            </span>
            <div className="properties__life-cycle-table">
              <table>
                <thead>
                  <tr>
                    <th>Sequence</th>
                    <th>Categories</th>
                  </tr>
                </thead>
                <tbody>
                  {_.map(
                    properties["study-categories"],
                    (categories, sequence) => {
                      return (
                        <tr>
                          <td>
                            {`${_.get(submission, "name", "")}\\${sequence}`}
                          </td>
                          <td>
                            <table>
                              {_.map(categories, (studyCateg, idx) => {
                                return (
                                  <tr key={idx}>
                                    <td style={{ paddingRight: "10px" }}>
                                      <Text
                                        type="regular"
                                        size="12px"
                                        text={studyCateg.name || ""}
                                      />
                                    </td>
                                    <td style={{ paddingRight: "10px" }}>
                                      <Text
                                        type="regular"
                                        size="12px"
                                        text={`[${studyCateg["info-type"]}]`}
                                      />
                                    </td>
                                    <td style={{ paddingRight: "10px" }}>
                                      <Text
                                        type="regular"
                                        size="12px"
                                        text={studyCateg.value || ""}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </table>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  isSTF = () => {
    const { properties } = this.props;
    return (
      _.get(properties, "version", "").includes("STF") ||
      _.get(properties, "STF", false)
    );
  };

  getLeafProperties = () => {
    const { m1Json, mode } = this.props;
    const isM1 = this.isM1();
    const isSTF = this.isSTF();
    const properties = isM1
      ? m1Json["m1-regional-properties"]
      : this.props.properties;
    if (!_.get(properties, "fileID", "") || (isSTF && mode === "standard")) {
      return null;
    }

    let containingFolder = _.get(properties, "[xlink:href]", "");
    const tokens = containingFolder.split("/");
    if (tokens.length > 1) {
      containingFolder = tokens[tokens.length - 2];
    } else {
      containingFolder = properties.operation === "delete" ? "" : "us";
    }

    return (
      <React.Fragment>
        {(isSTF || isM1) && (
          <div className="section-title">Leaf Properties</div>
        )}
        <RowItems>
          <div className="label">Title:</div>
          <div className="value">{properties.title || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">File Name:</div>
          <div className="value link">
            <a
              onClick={
                _.get(properties, "operation", "") === "delete"
                  ? ""
                  : this.openFile
              }
            >
              {this.getFileTypeIcon(this.getFileName(properties["xlink:href"]))}
              {this.getFileName(properties["xlink:href"])}
            </a>
          </div>
        </RowItems>
        {_.has(properties, "file-tag") && (
          <RowItems>
            <div className="label">File Tag:</div>
            <div className="value">{properties["file-tag"] || ""}</div>
          </RowItems>
        )}
        {_.has(properties, "site-identifier") && (
          <RowItems>
            <div className="label">Site Identifier:</div>
            <div className="value">{properties["site-identifier"] || ""}</div>
          </RowItems>
        )}
        <RowItems>
          <div className="label">eCTD Operation:</div>
          <div className="value">{properties.operation || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Leaf ID:</div>
          <div className="value">{properties.ID || ""}</div>
        </RowItems>
        {properties["xlink:href"] && (
          <RowItems>
            <div className="label">File Link(Href):</div>
            <div className="value link">
              <a
                onClick={
                  _.get(properties, "operation", "") === "delete"
                    ? ""
                    : this.openFile
                }
              >
                {properties["xlink:href"] || ""}
              </a>
            </div>
          </RowItems>
        )}
        {properties.checksum && (
          <RowItems>
            <div className="label">Checksum:</div>
            <div className="value">{properties.checksum || ""}</div>
          </RowItems>
        )}
        <RowItems>
          <div className="label">Checksum Type:</div>
          <div className="value">{properties["checksum-type"] || ""}</div>
        </RowItems>
        {properties["modified-file"] && (
          <RowItems>
            <div className="label">Modified File:</div>
            <div className="value">{properties["modified-file"] || ""}</div>
          </RowItems>
        )}
        {properties.version && (
          <RowItems>
            <div className="label">Version:</div>
            <div className="value">{properties.version || ""}</div>
          </RowItems>
        )}
        <RowItems>
          <div className="label">Xlink Type:</div>
          <div className="value">{properties["xlink:type"]}</div>
        </RowItems>
        {containingFolder && (
          <RowItems>
            <div className="label">Containing Folder:</div>
            <div className="value global__center-vert">
              {this.getFileTypeIcon("folder")}
              {containingFolder}
            </div>
          </RowItems>
        )}
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
    return _.get(properties, "hash", "") && !properties.isSequence;
  };

  isRootSequence = () => {
    const { properties } = this.props;
    return _.get(properties, "hash", "") && properties.isSequence;
  };

  getFirstSeq = () => {
    const { sequences, selectedCustomer, selectedSubmission } = this.props;
    const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
      selectedSubmission,
      "id",
      ""
    )}`;
    let sequenceList = sequences[id];
    sequenceList = getOrderedSequences(sequenceList);
    const firstSeq = _.get(sequenceList, "[0]");
    return firstSeq || "";
  };

  getLastSeq = () => {
    const { sequences, selectedCustomer, selectedSubmission } = this.props;
    const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
      selectedSubmission,
      "id",
      ""
    )}`;
    let sequenceList = sequences[id];
    sequenceList = getOrderedSequences(sequenceList);
    const lastSeq = _.get(sequenceList, `[${sequenceList.length - 1}]`);
    return lastSeq || "";
  };

  getSequenceProperties = () => {
    const {
      projectJson,
      submission,
      sequences,
      selectedSequence,
      selectedCustomer,
      selectedSubmission
    } = this.props;

    const id = `${_.get(selectedCustomer, "id", "")}_${_.get(
      selectedSubmission,
      "id",
      ""
    )}`;
    let sequenceList = sequences[id];
    sequenceList = getOrderedSequences(sequenceList);
    const currentIndex = _.findIndex(
      sequenceList,
      seq => seq.id === _.get(selectedSequence, "id")
    );
    if (currentIndex < 0) {
      return;
    }
    const nextSeq = _.get(sequenceList, `[${currentIndex + 1}]`);
    const previousSeq = _.get(sequenceList, `[${currentIndex - 1}]`);
    let nextSeqName = "";
    let previousSeqName = "";
    nextSeqName = nextSeq && nextSeq.name;
    nextSeqName =
      nextSeqName &&
      `${_.get(submission, "name")}\\${nextSeqName} (${_.get(
        nextSeq,
        "submission_type",
        ""
      )}-${_.get(nextSeq, "submission_sub_type", "")})`;

    previousSeqName = previousSeq && previousSeq.name;
    previousSeqName =
      previousSeqName &&
      `${_.get(submission, "name")}\\${previousSeqName} (${_.get(
        previousSeq,
        "submission_type",
        ""
      )}-${_.get(previousSeq, "submission_sub_type", "")})`;

    const currentSeq = `${_.get(submission, "name")}\\${_.get(
      selectedSequence,
      "name",
      ""
    )} (${_.get(nextSeq || previousSeq, "submission_type", "")}-${_.get(
      nextSeq || previousSeq,
      "submission_sub_type",
      ""
    )})`;

    /* const nextSeq = _.get(projectJson, "next_seq", "");
    const previousSeq = _.get(projectJson, "pre_seq", "");
    let nextSeqName = "";
    let previousSeqName = "";
    nextSeqName = nextSeq && nextSeq.name;
    nextSeqName =
      nextSeqName &&
      `${_.get(submission, "name")}\\${nextSeqName} (${_.get(
        nextSeq,
        "submission_type",
        ""
      )}-${_.get(nextSeq, "submission_sub_type", "")})`;

    previousSeqName = previousSeq && previousSeq.name;
    previousSeqName =
      previousSeqName &&
      `${_.get(submission, "name")}\\${previousSeqName} (${_.get(
        previousSeq,
        "submission_type",
        ""
      )}-${_.get(previousSeq, "submission_sub_type", "")})`;

    const currentSeq = `${_.get(submission, "name")}\\${_.get(
      projectJson,
      "name",
      ""
    )} (${_.get(nextSeq || previousSeq, "submission_type", "")}-${_.get(
      nextSeq || previousSeq,
      "submission_sub_type",
      ""
    )})`; */
    return (
      <React.Fragment>
        <RowItems>
          <div className="label">Current Sequence:</div>
          <div className="value">{currentSeq || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">Containing Folder:</div>
          <div className="value">{projectJson["containing_folder"] || ""}</div>
        </RowItems>
        {previousSeqName && (
          <RowItems>
            <div className="label">Previous Sequence:</div>
            <div className="value">{previousSeqName}</div>
          </RowItems>
        )}
        {nextSeqName && (
          <RowItems>
            <div className="label">Next Sequence:</div>
            <div className="value">{nextSeqName}</div>
          </RowItems>
        )}
      </React.Fragment>
    );
  };

  getRootProperties = () => {
    const { m1Json, projectJson, submission } = this.props;
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
    const firstSeq = `${_.get(submission, "name")}\\${this.getFirstSeq().name ||
      ""} (${this.getFirstSeq().submission_type || ""}-${this.getFirstSeq()
      .submission_sub_type || ""})`;
    const lastSeq = `${_.get(submission, "name")}\\${this.getLastSeq().name ||
      ""} (${this.getLastSeq().submission_type || ""}-${this.getLastSeq()
      .submission_sub_type || ""})`;
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
        <RowItems>
          <div className="label">Containing Folder:</div>
          <div className="value">{projectJson["containing_folder"] || ""}</div>
        </RowItems>
        <RowItems>
          <div className="label">First Sequence:</div>
          <div className="value">{firstSeq}</div>
        </RowItems>
        <RowItems>
          <div className="label">Last Sequence:</div>
          <div className="value">{lastSeq}</div>
        </RowItems>
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
    if (this.isRootSubmission() || this.isRootSequence()) {
      return null;
    }
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
        {_.has(properties, "indication") && (
          <RowItems>
            <div className="label">Indication:</div>
            <div className="value">{properties.indication || ""}</div>
          </RowItems>
        )}
        {_.has(properties, "formType") && (
          <RowItems>
            <div className="label">Form Type:</div>
            <div className="value">{properties.formType || ""}</div>
          </RowItems>
        )}
        {_.has(properties, "product-name") && (
          <RowItems>
            <div className="label">Product Name:</div>
            <div className="value">{properties["product-name"] || ""}</div>
          </RowItems>
        )}
        {_.has(properties, "substance") && (
          <RowItems>
            <div className="label">Substance:</div>
            <div className="value">{properties.substance || ""}</div>
          </RowItems>
        )}
        {_.has(properties, "manufacturer") && (
          <RowItems>
            <div className="label">Manufacturer:</div>
            <div className="value">{properties.manufacturer || ""}</div>
          </RowItems>
        )}
        {_.has(properties, "dosageform") && (
          <RowItems>
            <div className="label">Dosage Form:</div>
            <div className="value">{properties.dosageform || ""}</div>
          </RowItems>
        )}
        {_.has(properties, "excipient") && (
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

      // let phones = contact.telephones.telephone;
      // phones.map((number) =>{
      //   console.log("number",number.$t)
      //   console.log("telephone",number)
      //   let phoneTxt =  `${_.get(number, "[$t]", "")}`;
      //   console.log("phoneTxt",phoneTxt);
      // });

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
    const {
      m1Json,
      properties,
      sequence,
      view,
      projectJson,
      formFile
    } = this.props;
    const m1Properties = m1Json["m1-regional-properties"];
    const applicantInfo = _.get(m1Json, "[admin][applicant-info]");
    const application = _.get(m1Json, "[admin][application-set][application]");
    const applicationNumber = _.get(
      application,
      "[application-information][application-number]"
    );
    const applicationType =
      applicationNumber &&
      _.get(
        _.find(
          _.get(TypesJson, "[application-type]", ""),
          type => type.code === applicationNumber["application-type"]
        ),
        "display",
        ""
      );
    const submissionInfo = _.get(application, "[submission-information]");
    const submissionType = _.get(
      _.find(
        _.get(TypesJson, "[submission-type]", ""),
        type =>
          type.code ===
          _.get(submissionInfo, "[submission-id][submission-type]", "")
      ),
      "display",
      ""
    );
    const leafProperties =
      this.isM1() &&
      _.get(
        m1Json,
        "m1-administrative-information-and-prescribing-information.leaf[0]"
      );
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
            <div className="value">
              {_.get(m1Properties, "title", "") ||
                _.get(leafProperties, "title", "")}
            </div>
          </RowItems>
        )}
        <RowItems>
          <div className="label">Submission Description:</div>
          <div className="value">
            {(_.size(_.get(applicantInfo, "submission-description", "")) ||
              "") &&
              _.get(applicantInfo, "submission-description")}
          </div>
        </RowItems>
        <RowItems>
          <div className="label">Company Name:</div>
          <div className="value">
            {(_.size(_.get(applicantInfo, "[company-name]", "")) || "") &&
              _.get(applicantInfo, "[company-name]")}
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
        {_.has(submissionInfo, "date") && (
          <RowItems>
            <div className="label">Date Type: </div>
            <div className="value">{_.get(submissionInfo, "date", "")}</div>
          </RowItems>
        )}
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
        {formFile.length &&
          _.map(formFile, file => {
            return (
              <RowItems key={file}>
                <div className="label">Form: </div>
                <div className="value link">
                  <a onClick={this.openFormFile(file)}>
                    {this.getFileTypeIcon(_.get(file, "[xlink:href]", ""))}
                    {this.getFileName(_.get(file, "[xlink:href]", ""))}
                  </a>
                </div>
              </RowItems>
            );
          })}
        {leafProperties && (
          <React.Fragment>
            <div className="section-title">Leaf Properties</div>
            <RowItems>
              <div className="label">Title:</div>
              <div className="value">{leafProperties.title || ""}</div>
            </RowItems>
            <RowItems>
              <div className="label">File Name:</div>
              <div className="value">
                {this.getFileTypeIcon(
                  this.getFileName(leafProperties["xlink:href"])
                )}
                {this.getFileName(leafProperties["xlink:href"])}
              </div>
            </RowItems>
            <RowItems>
              <div className="label">eCTD Operation:</div>
              <div className="value">{leafProperties.operation || ""}</div>
            </RowItems>
            <RowItems>
              <div className="label">Leaf ID:</div>
              <div className="value">{leafProperties.ID || ""}</div>
            </RowItems>
            <RowItems>
              <div className="label">File Link(Href):</div>
              <div className="value">{leafProperties["xlink:href"] || ""}</div>
            </RowItems>
            <RowItems>
              <div className="label">Checksum:</div>
              <div className="value">{leafProperties.checksum || ""}</div>
            </RowItems>
            <RowItems>
              <div className="label">Checksum Type:</div>
              <div className="value">
                {leafProperties["checksum-type"] || ""}
              </div>
            </RowItems>
            <RowItems>
              <div className="label">Xlink Type:</div>
              <div className="value">{leafProperties["xlink:type"]}</div>
            </RowItems>

            <RowItems>
              <div className="label">Containing Folder:</div>
              <div className="value global__center-vert">
                {this.getFileTypeIcon("folder")}
                us
              </div>
            </RowItems>
          </React.Fragment>
        )}
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

  getLifeCycleTable = () => {
    const { properties, mode, lifeCycles: lifeCycleData } = this.props;
    if (!properties.fileID || (this.isSTF() && mode === "standard")) {
      return null;
    }

    let lifeCycles = _.intersectionWith(
      lifeCycleData,
      [properties.ID],
      (a, b) => {
        return _.intersectionWith(a, [b], (a, b) => a.ID === b).length > 0;
      }
    );

    return (
      <React.Fragment>
        <span className="properties-life-cycle-title">
          {this.isSTF() ? "STF Life Cycle" : "Document Life Cycle"}
        </span>
        <div className="properties__life-cycle-table">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th style={{ paddingLeft: "4px", paddingRight: "4px" }}>
                  Operation
                </th>
                <th>Leaf ID</th>
                <th>Modified File</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {_.map(lifeCycles[0], (lifeCycle, idx) => (
                <tr key={idx}>
                  <td className="properties__life-cycle-table-link link">
                    <div className="global__center-vert">
                      <Icon
                        className="properties__life-cycle-table-link"
                        type="right-square"
                        style={{
                          marginLeft: "-6px",
                          fontSize: "15px",
                          visibility:
                            properties.sequence === lifeCycle.sequence
                              ? "visible"
                              : "hidden"
                        }}
                      />
                      <a
                        onClick={
                          _.get(lifeCycle, "operation", "") === "delete"
                            ? ""
                            : this.openLifeCycleFile(lifeCycle)
                        }
                        style={{ marginLeft: "10px" }}
                      >
                        {this.getFileName(lifeCycle["xlink:href"])}
                      </a>
                    </div>
                  </td>
                  <td>{lifeCycle.operation}</td>
                  <td>{this.getLifeCycleId(lifeCycle)}</td>
                  <td className="properties__life-cycle-table-link">
                    {this.getModifiedFile(lifeCycle)}
                  </td>
                  <td className="properties__life-cycle-table-text">
                    {lifeCycle.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { properties, role } = this.props;
    if (
      !properties ||
      (!isLoggedInCustomerAdmin(role) &&
        !isLoggedInOmniciaAdmin(role) &&
        !properties.hasAccess)
    ) {
      return null;
    }
    return (
      <div className="properties">
        <div className="properties__table">
          {this.isRootSubmission() && this.getRootProperties()}
          {this.isRootSequence() && (
            <React.Fragment>
              {this.getSequenceProperties()}
              <div className="section-title">M1 Properties</div>
              {this.getM1Properties()}
            </React.Fragment>
          )}
          {this.isFolder() && this.getFolderProperties()}
          {this.isSTF() && this.getStfProperties()}
          {this.isM1() && this.getM1Properties()}
          {this.getLeafProperties()}
        </div>
        {this.getLifeCycleTable()}
      </div>
    );
  }
}

const RowItems = styled(Row)`
  padding: 4px 0px;
  padding-left: 30px;
  justify-content: normal;
  align-items: normal;
`;

function mapStateToProps(state) {
  const id = `${_.get(state.Customer.selectedCustomer, "id", "")}_${
    state.Application.selectedSubmission.id
  }`;
  return {
    role: state.Login.role,
    selectedCustomer: state.Customer.selectedCustomer,
    selectedSubmission: state.Application.selectedSubmission,
    selectedSequence: state.Submission.selectedSequence,
    sequences: state.Submission.sequences,
    lifeCycles: _.get(
      state,
      `Submission.lifeCycleJson[${id}].fileLifeCycles`,
      []
    )
  };
}

export default connect(mapStateToProps)(NodeProperties);
