import React from "react";
import moment from "moment";
import { Modal, Table } from "antd";
import { Text, OmniButton } from "../../uikit/components";
import { translate } from "../../translations/translator";

const Columns = [
  {
    title: translate("label.dashboard.application"),
    dataIndex: "application.name",
    key: "application",
    width: 200,
    render: text => <Text type="medium" size="12px" text={text} />
  },
  {
    title: translate("label.licence.duration"),
    dataIndex: "duration.name",
    key: "duration",
    width: 200,
    render: text => <Text type="medium" size="12px" text={text} />
  },
  {
    title: translate("label.licence.expirationdate"),
    dataIndex: "expirationdate",
    key: "expirationdate",
    width: 150,
    render: (text, record) => (
      <Text
        type="medium"
        size="12px"
        text={moment()
          .add(record.duration.duration, "days")
          .calendar()}
      />
    )
  },
  {
    title: translate("label.generic.quantity"),
    dataIndex: "quantity",
    key: "quantity",
    width: 100,
    render: text => <Text type="medium" size="12px" text={text} />
  }
];

const LicencePreview = ({ closeModal, back, licences, visible, submit }) => {
  return (
    <Modal
      destroyOnClose
      visible={visible}
      closable={false}
      footer={null}
      wrapClassName="licence-modal"
    >
      <div className="licence-modal__header" style={{ marginBottom: "unset" }}>
        <Text
          type="extra_bold"
          size="16px"
          text={`${translate("label.button.add", {
            type: translate("label.licence.licence")
          })}`}
        />
        <img
          src="/images/close.svg"
          className="licence-modal__header-close"
          onClick={closeModal}
        />
      </div>
      <Text
        type="regular"
        size="14px"
        opacity={0.5}
        text={`${translate("text.licence.belowarecorrect")}`}
      />
      <div style={{ marginTop: "20px" }}>
        <Table
          columns={Columns}
          dataSource={licences}
          pagination={false}
          scroll={{ x: true, y: 200 }}
        />
      </div>
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <OmniButton
          type="secondary"
          label={translate("label.button.cancel")}
          onClick={closeModal}
          buttonStyle={{ width: "120px", marginRight: "12px" }}
        />
        <OmniButton
          label={translate("label.pagination.back")}
          buttonStyle={{ width: "120px", marginRight: "10px" }}
          onClick={back}
        />
        <OmniButton
          label={translate("label.button.savesubmit")}
          buttonStyle={{ width: "120px" }}
          onClick={submit}
        />
      </div>
    </Modal>
  );
};

export default LicencePreview;
