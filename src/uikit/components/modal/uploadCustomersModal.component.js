import React, { Component } from "react";
import { Modal, Upload } from "antd";
import { indexOf, get } from "lodash";
import { OmniButton } from "..";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";
import { Toast } from "../../../uikit/components";

const dummyRequest = ({ file, onSuccess }) => {
  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};

class UploadCustomersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      fileList: [],
    };
  }

  /**
   * on selection of file
   * @param {Object} info - file object
   */
  onFileSelected = (info, event) => {
    const { file } = info;
    let fileList = [...info.fileList];
    const fileName = file.name;
    //removing selected file on clicking remove
    if (file.status === "removed") {
      this.setState({ selectedFile: null, fileList });
      return;
    }
    //Checking for CSV file
    if (
      fileName.substr(fileName.lastIndexOf(".") + 1).toLowerCase() !== "csv"
    ) {
      Toast.error("Please upload only .csv files");
      return;
    }
    // Limit the number of uploaded files
    // Only to show one recent uploaded files, and old file will be replaced by the new
    fileList = fileList.slice(-1);
    this.setState({ selectedFile: get(file, "originFileObj", ""), fileList });
  };

  /**
   * upload csv file
   */
  uploadCSV = () => {
    const { selectedFile } = this.state;
    this.props.fileChange(selectedFile);
  };

  render() {
    const { closeModal } = this.props;
    const { selectedFile, fileList } = this.state;
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
            fileList={fileList}
            onChange={this.onFileSelected}
            customRequest={dummyRequest}
            accept=".csv"
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
            disabled={!selectedFile}
            onClick={this.uploadCSV}
          />
        </div>
      </Modal>
    );
  }
}

export default UploadCustomersModal;
