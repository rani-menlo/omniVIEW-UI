import React from "react";
import moment from "moment";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { Text, ImageLoader, OmniButton } from "../../uikit/components";
import { Modal } from "antd";
import { getFormattedDate } from "../../utils";

const AssignLicence = ({
  closeModal,
  licence,
  user,
  visible,
  submit,
  back
}) => {
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
          text={translate("label.usermgmt.assignlicence")}
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
        text={translate("text.licence.areyousuretoassign")}
      />
      <div className="licence-modal__assign">
        <Text type="medium" size="14px" text={_.get(licence, "name", "")} />
        <Text
          type="regular"
          size="14px"
          text={`${_.get(licence, "licenceType", "") ||
            _.get(licence, "type_name", "")} - ${translate(
            "label.generic.purchasedon",
            {
              date: getFormattedDate(
                _.get(licence, "purchaseDate", null) ||
                  _.get(licence, "purchase_date", "")
              )
            }
          )}`}
        />
        <div className="licence-modal__assign__user global__center-vert">
          <ImageLoader
            type="circle"
            path={_.get(user, "profile", null)}
            width="35px"
            height="35px"
          />
          <div style={{ marginLeft: "10px" }}>
            <Text
              type="regular"
              size="14px"
              text={`${_.get(user, "first_name", "")} ${_.get(
                user,
                "last_name",
                ""
              )}`}
            />
            <Text
              type="regular"
              size="14px"
              opacity={0.75}
              className={`global__text-${
                _.get(user, "license_status", 0) ? "green" : "red"
              }`}
              text={
                _.get(user, "license_status", 0)
                  ? translate("label.user.active")
                  : translate("label.user.inactive")
              }
              textStyle={{ display: "inline" }}
            />
            <Text
              type="regular"
              size="14px"
              opacity={0.75}
              text={`${(_.get(user, "license_status", 0) || "") &&
                ` - License ${translate(
                  "label.usermgmt.expires"
                )}`} ${getFormattedDate(_.get(user, "expiryDate"))}`}
              textStyle={{ display: "inline" }}
            />
          </div>
        </div>
        <Text
          type="regular"
          size="14px"
          text={translate("text.licence.accesspermitteduntil", {
            date: moment()
              .add(_.get(licence, "duration", 0), "days")
              .calendar()
          })}
        />
      </div>
      <div style={{ marginTop: "40px", textAlign: "right" }}>
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
          label={translate("label.usermgmt.assignlicence")}
          buttonStyle={{ width: "120px" }}
          onClick={submit}
        />
      </div>
    </Modal>
  );
};

export default AssignLicence;
