import React, { Component } from "react";
import { Modal, message } from "antd";
import { OmniButton } from "..";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";
import { Upload } from "antd";

const dummyRequest = ({ file, onSuccess }) => {
  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};

class UploadCustomersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.uploadCustContainer = React.createRef();
  }

  /**
   * on selection of file
   * @param {Object} info - file object
   */
  onFileSelected = (info) => {
    const { file, target } = info;
    console.log(file, "file");
    if (target) {
      return;
    }
    if (file.status === "uploading") {
      this.props.fileChange(info);
    }
  };

  render() {
    const { closeModal, user } = this.props;
    return (
      <Modal
        visible
        destroyOnClose
        closable={false}
        footer={null}
        wrapClassName="upload-customers-modal"
      >
        <div
          className="upload-customers-modal__header"
          style={{ marginBottom: "0px" }}
        >
          <Text
            type="extra_bold"
            size="16px"
            text={translate("label.button.uploadCustomers")}
          />
          <img
            src="/images/close.svg"
            className="upload-customers-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <div>
          <Upload.Dragger
            className="upload-customers-modal__upload"
            multiple={false}
            showUploadList={true}
            onChange={this.onFileSelected}
            customRequest={dummyRequest}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          >
            <p className="upload-customers-modal__upload-inner">
              <img
                src="/images/upload.svg"
                className="upload-customers-modal__upload-inner-image"
              />
              <span className="upload-customers-modal__upload-inner-drag">
                {translate("text.generic.dragdrop")}{" "}
              </span>
              <span className="upload-customers-modal__upload-inner-choose">
                {translate("text.generic.chooseCsv")}
              </span>
            </p>
          </Upload.Dragger>
          {/* <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            ref={this.uploadCustContainer}
            style={{ display: "none" }}
            onChange={this.onFileSelected}
          /> */}
        </div>

        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            onClick={closeModal}
            buttonStyle={{ width: "120px", marginRight: "12px" }}
          />
          <OmniButton
            label={translate("label.button.upload")}
            buttonStyle={{ width: "120px" }}
            onClick={this.upload}
          />
        </div>
      </Modal>
    );
  }
}

export default UploadCustomersModal;
