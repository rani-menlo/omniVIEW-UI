import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import DraggableModal from "./draggableModal.component";
import { isLoggedInOmniciaRole, getOrderedSequences } from "../../../utils";
import { bindActionCreators } from "redux";
import { ApplicationActions, SubmissionActions } from "../../../redux/actions";
import Text from "../text/text.component";

import { getSequences } from "../../../redux/selectors/submissionView.selector";
import { translate } from "../../../translations/translator";
import { Tabs, Checkbox, Icon, Button, Table } from "antd";

const { TabPane } = Tabs;

class SequencesModal extends Component {
  static propTypes = {
    closeModal: PropTypes.func,
    onItemSelected: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      order: "asc",
      selectedSequences: []
    };
    //sequences modalcolumns
    // here text refers to the dynamic text which we pass from the json data
    this.sequenceColumns = [
      {
        title: "Sequence #",
        dataIndex: "name",
        key: "id",
        render: text => (
          <Text
            type="regular"
            size="14px"
            text={`${_.get(props.submission, "name", "")}\\${text}`}
          />
        )
      }
    ];
  }

  componentDidMount() {}

  delete = () => {
    this.props.onDelete &&
      this.props.onDelete(this.state.selectedSequences, this.props.sequences);
  };

  render() {
    const { visible, closeModal, submission, sequences } = this.props;
    const { order, selectedSequences } = this.state;
    const submissionLabel = _.get(submission, "name", "");
    const orderedSequences = getOrderedSequences(sequences, order);
    console.log("sequences", orderedSequences);
    return (
      <DraggableModal
        visible={visible}
        draggableAreaClass=".sequences-modal__header"
      >
        <div className="sequences-modal">
          <div className="sequences-modal__header">
            <Text type="regular" size="16px" text="Delete Sequences" />
            <img
              src="/images/close.svg"
              className="sequences-modal__header-close"
              onClick={closeModal}
            />
          </div>
          <div className="sequences-modal__table">
            <div className="sequences-modal__table__body">
              <table>
                {/* <thead>
                  <tr>
                    <td style={{ width: "20px" }}>
                      <Checkbox />
                    </td>
                    <td>Select All</td>
                  </tr>
                </thead> */}

                <tbody>
                  {/* <tr>
                    <td style={{ width: "20px" }}>
                      <Checkbox />
                    </td>
                    <td>
                      <div style={{ display: "flex" }}>
                        <Icon
                          type="folder"
                          theme="filled"
                          className="global__file-folder"
                        />
                        <Text
                          type="regular"
                          size="12px"
                          text="ind180410\0001 (Original Application-Presubmission)"
                          textStyle={{ marginTop: "3px" }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "20px" }}>
                      <Checkbox />
                    </td>
                    <td>
                      <div style={{ display: "flex" }}>
                        <Icon
                          type="folder"
                          theme="filled"
                          className="global__file-folder"
                        />
                        <Text
                          type="regular"
                          size="12px"
                          text="ind180410\0002 (Original Application-Presubmission)"
                          textStyle={{ marginTop: "3px" }}
                        />
                      </div>
                    </td>
                  </tr> */}
                  {/* {_.map(getOrderedSequences(sequences, order), sequence => (
                    <tr>
                      <td style={{ width: "20px" }}>
                        <Checkbox />
                      </td>
                      <td>
                        <div style={{ display: "flex" }}>
                          <Icon
                            type="folder"
                            theme="filled"
                            className="global__file-folder"
                          />
                          <Text
                            type="regular"
                            size="12px"
                            text={`${submissionLabel}\\${sequence.name}`}
                            textStyle={{ marginTop: "3px" }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))} */}

                  <Table
                    columns={this.sequenceColumns}
                    dataSource={orderedSequences}
                    pagination={false}
                    rowSelection={{
                      onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({
                          selectedSequences: selectedRows
                        });
                      }
                    }}
                    // scroll={{ y: 200 }}
                  />
                </tbody>
              </table>
            </div>
          </div>

          <div className="sequences-modal__footer">
            <div className="sequences-modal__footer-text">
              <img
                src="/images/warning.png"
                className="sequences-modal__footer-image"
              />
              <Text
                type="regular"
                size="12px"
                textStyle={{ margin: "5px 0 0 5px" }}
                text={translate("label.deleteSequences.warning")}
              />
            </div>
            <div className="sequences-modal__footer-buttons">
              <Button
                type="primary"
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "12px",
                  width: "85px"
                }}
                onClick={closeModal}
              >
                Close
              </Button>
              <Button
                disabled={
                  !selectedSequences.length && selectedSequences.length <= 0
                }
                style={{
                  background: "red",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "12px",
                  width: "85px",
                  marginLeft: "10px"
                }}
                onClick={this.delete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DraggableModal>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.Api.loading,
    role: state.Login.role,
    user: state.Login.user,
    access: state.Application.access,
    sequences: getSequences(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators({ ...SubmissionActions }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SequencesModal);
