import React from "react";
import PropTypes from "prop-types";
import { Modal } from "antd";
import { OmniButton } from "..";
import { translate } from "../../../translations/translator";

const DeactivateModal = ({
  visible,
  title,
  content,
  closeModal,
  deactivate
}) => {
  return (
    <Modal visible={visible} closable={false} footer={null} wrapClassName="">
      <div className="deactivate-modal">
        <span className="deactivate-modal-title">{title}</span>
        <img
          src="/images/close.svg"
          className="deactivate-modal-close"
          style={{
            width: "20px",
            height: "20px",
            cursor: "pointer"
          }}
          onClick={closeModal}
        />
        <p className="deactivate-modal-content">{content}</p>
        <div className="deactivate-modal-buttons">
          <OmniButton
            type="secondary"
            label={translate("label.button.cancel")}
            className=""
            onClick={closeModal}
          />
          <OmniButton
            type="primary"
            label={translate("label.usermgmt.deactivate")}
            className="deactivate-modal-buttons-deactivate"
            buttonStyle={{ marginLeft: "16px" }}
            onClick={deactivate}
          />
        </div>
      </div>
    </Modal>
  );
};

DeactivateModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  content: PropTypes.string,
  closeModal: PropTypes.func,
  deactivate: PropTypes.func
};

export default React.memo(DeactivateModal);
