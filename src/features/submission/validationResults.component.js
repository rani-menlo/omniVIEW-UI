import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Icon, Button } from "antd";
import ValidateIcon from "../../../assets/images/folder-validate.svg";
import AlertHighIcon from "../../../assets/images/alert-high.svg";
import AlertMediumIcon from "../../../assets/images/alert-medium.svg";
import AlertLowIcon from "../../../assets/images/alert-low.svg";
import { SubmissionActions } from "../../redux/actions";
import Loader from "../../uikit/components/loader";
import _ from 'lodash';

class ValidationResults extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    sequenceId: PropTypes.string | PropTypes.number,
    label: PropTypes.string
  };
  static defaultProps = {
    label: ""
  };
  componentDidMount() {
    const { sequenceId } = this.props;
    sequenceId && this.props.actions.validateSequence(sequenceId);
  }

  getAlertIcon = severity => {
    if (severity === "Low") {
      return AlertLowIcon;
    } else if (severity === "Medium") {
      return AlertMediumIcon;
    } else {
      return AlertHighIcon;
    }
  };
  render() {
    const { onClose, validations, loading, label } = this.props;
    return (
      <React.Fragment>
        <Loader loading={loading} />
        <div className="validationResults">
          <div className="validationResults__header">
            <div className="validationResults__header__title">
              <img src={ValidateIcon} />
              <span className="validationResults__header__title-text">
                {" "}
                eCTD Sequence Validation [{label}]
              </span>
            </div>
            <Icon
              type="close"
              className="validationResults__header-close"
              onClick={onClose}
            />
          </div>
          <div className="validationResults__table">
            <div className="validationResults__table__header">
              <table>
                <thead>
                  <tr>
                    <th className="validationResults__table-col col-node">
                      Node
                    </th>
                    <th className="validationResults__table-col col-error">
                      Error
                    </th>
                    <th className="validationResults__table-col col-severity">
                      Severity
                    </th>
                    <th className="validationResults__table-col col-description">
                      Description
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="validationResults__table__body">
              <table>
                <tbody>
                  {_.map(validations, validation => {
                    return (
                      <tr>
                        <td className="col-node">
                          <Icon
                            type="folder"
                            theme="filled"
                            className="global__file-folder"
                          />
                          <span>{validation.node}</span>
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
                          {validation.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="validationResults__footer">
            <div className="validationResults__footer__viewreport">
              View Report
            </div>
            <Button type="primary" onClick={onClose}>
              close
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    validations: state.Submission.validations
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...SubmissionActions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ValidationResults);
