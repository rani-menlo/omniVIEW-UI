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
        <div className="errors-modal__table scrollbar">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
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
                            text={`${get(
                              customer,
                              "Company Name",
                              ""
                            )} Error Details`}
                            size="14px"
                          />
                        </td>
                        <td>
                          {customer.errorMessages.map((error, idx) => (
                            <Text
                              type="regular"
                              text={error}
                              size="14px"
                              textStyle={{
                                borderBottom: `${
                                  customer.errorMessages.length - 1 == idx
                                    ? 0
                                    : 1
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
        </div>
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
