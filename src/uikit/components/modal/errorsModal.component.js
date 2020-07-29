import React, { Component } from "react";
import { Modal, Table } from "antd";
import { OmniButton } from "..";
import { get, map } from "lodash";
import Text from "../text/text.component";
import { translate } from "../../../translations/translator";

class ErrorsModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { closeModal, customersErrors } = this.props;
    return (
      <Modal
        visible
        destroyOnClose
        closable={false}
        footer={null}
        wrapClassName="errors-modal"
      >
        <div className="errors-modal__header" style={{ marginBottom: "0px" }}>
          <Text
            type="extra_bold"
            size="16px"
            text={translate("text.generic.errors")}
          />
          <img
            src="/images/close.svg"
            className="errors-modal__header-close"
            onClick={closeModal}
          />
        </div>
        <table className="errors-modal__table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody className="scrollbar">
            {customersErrors &&
              customersErrors.length &&
              customersErrors.map((customer, index) => {
                if (!customer.errorMessages.length) {
                  return null;
                }
                return (
                  <>
                    <tr key={index}>
                      <td className="errors-modal__table-customerName">
                        {" "}
                        <Text
                          type="regular"
                          text={`${get(customer, "Company Name", "N/A")}`}
                          size="14px"
                        />
                      </td>
                      <td>
                        {customer.errorMessages.map((error, idx) => (
                          <Text
                            type="regular"
                            text={error || "N/A"}
                            size="14px"
                            textStyle={{
                              borderBottom: `${
                                customer.errorMessages.length - 1 == idx
                                  ? 0
                                  : 0.5
                              }px solid rgba(74, 74, 74, 0.25)`,
                              padding: "8px 16px",
                            }}
                          />
                        ))}
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

export default ErrorsModal;
