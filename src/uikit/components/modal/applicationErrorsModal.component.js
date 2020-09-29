import React, { Component } from "react";
import { Modal, Table } from "antd";
import { OmniButton } from "..";
import { get, map, some } from "lodash";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";
import { isAdmin } from "../../../utils";

class ApplicationErrorsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedErrorSequences: [],
      selectedRowKeys: [],
      disableRetry: true,
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

  /**
   * Callback to the parent component to delete the failed sequences
   */
  deleteErrorSequences = () => {
    this.props.onDelete &&
      this.props.onDelete(this.state.selectedErrorSequences);
  };

  /**
   * OMNG-1089, Sprint-33, callback to the parent component to retry to upload the failed sequences
   */
  retryFailedSequences = () => {
    this.props.onRetry &&
      this.props.onRetry(this.state.selectedErrorSequences);
  };

  //on selecting rows in failure report window
  onRowSelected = (selectedRowKeys, selectedRows) => {
    const disableRetry = some(selectedRows, ["status", 4]);
    //const disableDelete = false;
    const { user, role } = this.props;
    if (user.is_secondary_contact || isAdmin(role.name)) {
      this.setState({
        selectedRowKeys,
        selectedErrorSequences: selectedRows,
        disableRetry,
        //disableDelete: false
      });
    }
  };

  render() {
    const { closeModal, application, errors, user, role } = this.props;
    const { selectedErrorSequences, disableRetry, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelected,
      hideDefaultSelections: true,
      selections: [
        {
          text: "Select Incorrect Sequences",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              return key.status == 4;
            });
            this.setState({
              selectedRowKeys: newSelectedRowKeys,
              selectedErrorSequences: newSelectedRowKeys,
              disableRetry: true,
            });
          },
        },
        {
          text: "Select Failed Sequences",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              return key.status != 4;
            });
            this.setState({
              selectedRowKeys: newSelectedRowKeys,
              selectedErrorSequences: newSelectedRowKeys,
              disableRetry: false,
            });
          },
        },
      ],
    };
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
            rowSelection={rowSelection}
          />
        </div>
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          {/* As per the ticket OMNG-682 we are allowing retry option only for
              secondary contact and admins*/}
          {get(user, "is_secondary_contact", "") || isAdmin(role.name) ? (
            <OmniButton
              disabled={!selectedErrorSequences.length || disableRetry}
              label="Retry"
              buttonStyle={{ width: "90px", margin: "0 20px 0 10px" }}
              onClick={this.retryFailedSequences}
            />
          ) : (
            ""
          )}
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
