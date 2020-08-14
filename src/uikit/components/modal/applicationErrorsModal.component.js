import React, { Component } from "react";
import { Modal, Table } from "antd";
import { OmniButton } from "..";
import { get, map } from "lodash";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";

class ApplicationErrorsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedErrorSequences: [],
    };
    this.uploadFailedColumns = [
      {
        title: translate("label.dashboard.sequence"),
        dataIndex: "pipeline_name",
        key: "id",
        render: (text) => <Text type="regular" size="14px" text={text} />,
      },

      {
        title: translate("label.generic.description"),
        dataIndex: "error_message",
        key: "error",
        render: (text) => (
          <Text
            type="regular"
            size="14px"
            text={text}
            textStyle={{ wordWrap: "break-word", wordBreak: "break-word" }}
          />
        ),
      },
    ];
  }

  deleteErrorSequences = () => {
    this.props.onDelete &&
      this.props.onDelete(this.state.selectedErrorSequences);
  };

  render() {
    const { closeModal, application, errors } = this.props;
    const { selectedErrorSequences } = this.state;
    return (
      <Modal
        visible
        destroyOnClose
        closable={false}
        footer={null}
        wrapClassName="application-errors-modal"
      >
        <div
          className="application-errors-modal__header"
          style={{ marginBottom: "0px" }}
        >
          <Text
            type="regular"
            size="16px"
            textStyle={{ paddingBottom: "12px", marginBottom: "0 !important" }}
            text={`${application.name} ${translate("text.generic.errors")}`}
          />
          <img
            src="/images/close.svg"
            className="application-errors-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <div className="application-errors-modal__table">
          <Table
            columns={this.uploadFailedColumns}
            dataSource={errors}
            pagination={false}
            // rowSelection={{
            //   onChange: this.onRowSelected
            // }}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                  selectedErrorSequences: selectedRows,
                });
              },
            }}
            //scroll={{ y: 200 }}
          />
        </div>
        {/* <table className="application-errors-modal__table">
          <thead>
            <tr>
              <th>{translate("label.dashboard.sequence")}</th>
              <th>{translate("label.dashboard.sequence")}</th>
              <th>{translate("label.generic.description")}</th>
            </tr>
          </thead>
          <tbody className="scrollbar">
            {errors &&
              errors.length &&
              map(errors, (error, index) => {
                return (
                  <>
                    <tr key={index}>
                      <td className="errors-modal__table-customerName">
                        {" "}
                        <Text
                          type="regular"
                          text={`${get(error, "pipeline_name", "N/A")}`}
                          size="14px"
                        />
                      </td>
                      <td className="errors-modal__table-customerName">
                        {" "}
                        <Text
                          type="regular"
                          text={`${get(error, "error_message", "N/A")}`}
                          size="14px"
                        />
                      </td>
                    </tr>
                  </>
                );
              })}
          </tbody>
        </table> */}
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <OmniButton
            disabled={!selectedErrorSequences.length}
            label="Delete"
            buttonStyle={{ width: "90px", margin: "0 20px 0 10px" }}
            onClick={this.deleteErrorSequences}
          />
          <OmniButton
            label={translate("label.button.close")}
            buttonStyle={{ width: "90px" }}
            onClick={closeModal}
          />
        </div>
      </Modal>
    );
  }
}

export default ApplicationErrorsModal;
