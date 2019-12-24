import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Icon, Button } from "antd";
import { SubmissionActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import _ from "lodash";
import { getValidationsBySequence } from "../../redux/selectors/validationResults.selector";
import { Text, Row, Toast } from "../../uikit/components";
import { translate } from "../../translations/translator";
import { URI, SERVER_URL } from "../../constants";

class ValidationResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sort: "asc",
      validationResults: [],
      selected: ""
    };
  }

  static propTypes = {
    onClose: PropTypes.func,
    sequence: PropTypes.object,
    label: PropTypes.string,
    onItemSelected: PropTypes.func
  };

  componentDidMount() {
    const { sequence } = this.props;
    sequence &&
      this.props.actions.validateSequence(sequence.id, err => {
        Toast.error("Internal server error. Please try again later.");
        this.props.onClose();
      });
  }

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    if (!state.validationResults.length) {
      newState.validationResults = props.validations;
    }
    return _.size(newState) ? { ...newState } : null;
  }

  getAlertIcon = severity => {
    if (severity === "Low") {
      return "/images/alert-low.svg";
    } else if (severity === "Medium") {
      return "/images/alert-medium.svg";
    } else {
      return "/images/alert-high.svg";
    }
  };

  sortColumn = key => () => {
    const { validationResults } = this.state;
    const sortBy = this.state.sort === "asc" ? "desc" : "asc";
    /* if (key === "severity") {
      validationResults.sort((result1, result2) => {
        if (result1.severity === "High") {
          return sortBy === "asc" ? 1 : -1;
        } else if (result1.severity === "Low") {
          return sortBy === "asc" ? -1 : 1;
        } else {
          return 0;
        }
      });
      this.setState({
        sort: sortBy,
        validationResults
      });
      return;
    } */
    const data = _.orderBy(validationResults, key, sortBy);
    this.setState({
      sort: sortBy,
      validationResults: data
    });
  };

  onItemSelected = (item, index) => () => {
    const { onItemSelected } = this.props;
    this.setState({ selected: index });
    onItemSelected && onItemSelected(item);
  };

  getValidationGroupIcon = validation => {
    const { group, isFile, isFolder } = validation;
    let img = (
      <Icon type="folder" theme="filled" className="global__file-folder" />
    );
    if (group === "M1" && isFile) {
      return (
        <img
          src="/images/file-new.svg"
          className="global__file-folder"
          style={{ width: "18px", height: "22px" }}
        />
      );
    }
    if (group === "STF" && isFolder) {
      return img;
    }
    switch (group) {
      case "File Checks":
      case "PDF":
        img = (
          <img
            src="/images/file-new.svg"
            className="global__file-folder"
            style={{ width: "18px", height: "22px" }}
          />
        );
        break;
      case "STF":
        img = (
          <img
            src={`/images/file-${isFile ? "new" : "stf"}.svg`}
            className="global__file-folder"
            style={{ width: "18px", height: "22px" }}
          />
        );
        break;
      default:
        return img;
    }
    return img;
  };

  openReport = () => {
    const authToken = localStorage.getItem("omniview_user_token");
    const {
      sequence: { id }
    } = this.props;
    let url = URI.VALIDATION_REPORT.replace("{sequenceId}", id);
    url = url.replace("{authToken}", authToken);
    url = `${SERVER_URL}${url}`;
    window.open(url, "_blank");
  };

  render() {
    const { onClose, label, sequence } = this.props;
    const { validationResults, sort, selected } = this.state;
    return (
      <React.Fragment>
        <div className="validationResults">
          <div className="validationResults__header">
            <div className="validationResults__header__title global__center-horiz-vert">
              <img
                src="/images/folder-validate.svg"
                style={{ marginRight: "5px" }}
              />
              <span className="validationResults__header__title-text">
                {" "}
                eCTD Sequence Validation [{label}\{_.get(sequence, "name", "")}]
              </span>
            </div>
            <Icon
              type="close"
              className="validationResults__header-close"
              onClick={onClose}
            />
          </div>
          <div className="validationResults__table">
            <div className="validationResults__table__body">
              <table>
                <thead>
                  <tr>
                    <th
                      className="validationResults__table-col col-node global__cursor-pointer"
                      onClick={this.sortColumn("title")}
                    >
                      Node{" "}
                      <img
                        className="col-node-icon"
                        src="/images/sort-result.svg"
                      />
                    </th>
                    <th
                      className="validationResults__table-col col-error global__cursor-pointer"
                      onClick={this.sortColumn("error_no")}
                    >
                      Error{" "}
                      <img
                        className="col-node-icon"
                        src="/images/sort-result.svg"
                      />
                    </th>
                    <th
                      className="validationResults__table-col col-severity global__cursor-pointer"
                      onClick={this.sortColumn("severity")}
                    >
                      Severity{" "}
                      <img
                        className="col-node-icon"
                        src="/images/sort-result.svg"
                      />
                    </th>
                    <th
                      className="validationResults__table-col col-description global__cursor-pointer"
                      onClick={this.sortColumn("description")}
                    >
                      Description{" "}
                      <img
                        className="col-node-icon"
                        src="/images/sort-result.svg"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody key={sort}>
                  {_.map(validationResults, (validation, idx) => {
                    return (
                      <tr
                        key={idx}
                        onClick={this.onItemSelected(validation, idx)}
                        className={`global__cursor-pointer ${selected === idx &&
                          "global__node-selected"}`}
                      >
                        <td className="col-node">
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span>
                              {this.getValidationGroupIcon(validation)}
                            </span>
                            <span
                              style={{
                                wordBreak: "break-word"
                              }}
                            >
                              {_.get(validation, "displayName", "") ||
                                (_.size(validation.title) > 0
                                  ? _.replace(validation.title, " [ ]", "")
                                  : "")}
                            </span>
                          </div>
                        </td>
                        <td className="col-error">{validation.error_no}</td>
                        <td className="col-severity">
                          <img
                            src={this.getAlertIcon(validation.severity)}
                            style={{ marginRight: "8px" }}
                          />
                          <span>{validation.severity}</span>
                        </td>
                        <td className="col-description">
                          <span
                            style={{
                              wordBreak: "break-word"
                            }}
                          >
                            {`${validation.description}${validation.extraInfo ||
                              ""}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="validationResults__footer">
            <div
              className="validationResults__footer__viewreport"
              onClick={this.openReport}
            >
              View Report
            </div>
            <Button
              type="primary"
              onClick={onClose}
              style={{ color: "white", fontWeight: 800, fontSize: "12px" }}
            >
              Close
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    validations: getValidationsBySequence(state, props)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...SubmissionActions }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ValidationResults);
