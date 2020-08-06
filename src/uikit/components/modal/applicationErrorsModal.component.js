import React, { Component } from "react";
import { Modal } from "antd";
import { OmniButton } from "..";
import { get, map } from "lodash";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";

class ApplicationErrorsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: [
        {
          id: 1,
          sequence_no: "0001",
          description: "Sequence belongs to another application",
        },
        {
          id: 2,
          sequence_no: "0002",
          description: "Sequence belongs to another application",
        },
      ],
    };
  }

  render() {
    const { closeModal, application } = this.props;
    const { errors } = this.state;
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
            alt="Close"
            className="application-errors-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <table className="application-errors-modal__table">
          <thead>
            <tr>
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
                          text={`${get(error, "sequence_no", "N/A")}`}
                          size="14px"
                        />
                      </td>
                      <td className="errors-modal__table-customerName">
                        {" "}
                        <Text
                          type="regular"
                          text={`${get(error, "description", "N/A")}`}
                          size="14px"
                        />
                      </td>
                    </tr>
                  </>
                );
              })}
          </tbody>
        </table>
        <div style={{ marginTop: "12px", textAlign: "right" }}>
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
