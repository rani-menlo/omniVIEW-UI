import React from "react";
import _ from "lodash";
import { Avatar, Modal, Icon } from "antd";
import { Row, Text, OmniButton } from "../../uikit/components";
import { getRoleName, getFormattedDate } from "../../utils";
import { translate } from "../../translations/translator";

const UserProfileCard = ({ user, visible, onClose, onEdit, onStatusClick }) => {
  return (
    <Modal
      visible={visible}
      closable={false}
      footer={null}
      className="userProfileCard-modal"
    >
      <div className="userProfileCard">
        <Icon
          type="close"
          className="userProfileCard-close"
          onClick={onClose}
        />
        <Avatar size={140} icon="user" />
        <Text
          className="userProfileCard-name"
          type="extra_bold"
          size="20px"
          text={`${_.get(user, "first_name", "")} ${_.get(
            user,
            "last_name",
            ""
          )}`}
        />

        <Text
          className="userProfileCard-role"
          type="regular"
          size="16px"
          text={getRoleName(_.get(user, "role_name", ""))}
        />
        <Row style={{ justifyContent: "space-between", width: "100%" }}>
          <Text
            type="regular"
            size="16px"
            text={`${translate("label.usermgmt.subscriptionstatus")}:`}
          />
          <Text
            className={`userProfileCard-${
              _.get(user, "is_active", false) ? "active" : "inactive"
            }`}
            type="regular"
            size="16px"
            text={
              _.get(user, "is_active", false)
                ? ` ${translate("label.user.active")}`
                : ` ${translate("label.user.inactive")}`
            }
          />
        </Row>
        {_.get(user, "role_id") !== 1 && (
          <Text
            textStyle={{ textAlign: "right", width: "100%" }}
            type="regular"
            size="14px"
            opacity={0.5}
            text={`${
              _.get(user, "is_active", false)
                ? translate("label.usermgmt.expires")
                : translate("label.usermgmt.expired")
            } ${getFormattedDate(_.get(user, "expired_date", ""))}`}
          />
        )}
        <OmniButton
          disabled
          className="userProfileCard-button"
          type="primary"
          label={translate("label.usermgmt.assignnewlicence")}
        />
        <OmniButton
          onClick={onEdit}
          className="userProfileCard-button"
          type="primary"
          label={`${translate("label.usermgmt.edit")} ${translate(
            "lable.profile.profile"
          )}`}
        />
        <Text
          onClick={onStatusClick}
          className="userProfileCard-link"
          type="regular"
          size="16px"
          text={
            _.get(user, "is_active", false)
              ? translate("label.usermgmt.deactivateacc")
              : translate("label.usermgmt.activateacc")
          }
        />
      </div>
    </Modal>
  );
};

export default React.memo(UserProfileCard);
