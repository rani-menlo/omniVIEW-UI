import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import DraggableModal from "./draggableModal.component";
import { getOrderedSequences } from "../../../utils";
import Text from "../text/text.component";

import { getSequences } from "../../../redux/selectors/submissionView.selector";
import { translate } from "../../../translations/translator";
import { Button, Table } from "antd";

class SequencesModal extends Component {
  static propTypes = {
    closeModal: PropTypes.func
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
    const { sequences } = this.props;
    let orderedSequences = getOrderedSequences(sequences, this.state.order);
    this.props.onDelete &&
      this.props.onDelete(this.state.selectedSequences, orderedSequences);
  };

  render() {
    const { visible, closeModal, sequences } = this.props;
    const { order, selectedSequences } = this.state;
    const orderedSequences = getOrderedSequences(sequences, order);
    console.log("sequences", orderedSequences, this.props);
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
              alt="close"
            />
          </div>
          <div className="sequences-modal__table">
            <div className="sequences-modal__table__body">
              <table>
                <tbody>
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
                alt="alert"
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
                  marginLeft: "10px",
                  border: "none"
                }}
                className={
                  !selectedSequences.length &&
                  selectedSequences.length <= 0 &&
                  "disabled"
                }
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
    sequences: getSequences(state)
  };
}

export default connect(mapStateToProps)(SequencesModal);
