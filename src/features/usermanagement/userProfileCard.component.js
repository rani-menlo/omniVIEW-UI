import React from "react";
import _ from "lodash";
import { Avatar, Modal, Icon } from "antd";
import { Row, Text, OmniButton, ImageLoader } from "../../uikit/components";
import { getRoleName, getFormattedDate } from "../../utils";
import { translate } from "../../translations/translator";
import { ROLE_IDS } from "../../constants";

const UserProfileCard = ({
  user,
  visible,
  onClose,
  onEdit,
  onStatusClick,
  onAssignLicence
}) => {
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
        <ImageLoader
          path={_.get(user, "profile")}
          width="140px"
          height="140px"
          type="circle"
        />
        {/* <Avatar size={140} icon="user" /> */}
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
        {_.get(user, "role_id") !== 1 && (<Row style={{ justifyContent: "space-between", width: "100%" }}>
          <Text
            type="regular"
            size="16px"
            text={`${translate("label.usermgmt.licensestatus")}:`}
          />
          <Text
            className={`userProfileCard-${
              _.get(user, "license_status", false) ? "active" : "inactive"
            }`}
            type="regular"
            size="16px"
            text={
              _.get(user, "license_status", 0)
                ? ` ${translate("label.user.active")}`
                : ` ${translate("label.user.inactive")}`
            }
          />
        </Row>)}
        {_.get(user, "role_id") !== ROLE_IDS.OMNICIA.administrator &&
          _.get(user, "expiryDate") && (
            <Text
              textStyle={{ textAlign: "right", width: "100%" }}
              type="regular"
              size="14px"
              opacity={0.5}
              text={`${(_.get(user, "is_active") || "") &&
                ` ${translate("label.usermgmt.expires")}`} ${getFormattedDate(
                _.get(user, "expiryDate")
              )}`}
            />
          )}
        {_.get(user, "role_id") !== ROLE_IDS.OMNICIA.administrator && (
          <OmniButton
            className="userProfileCard-button"
            type="primary"
            label={translate("label.usermgmt.assignnewlicence")}
            onClick={onAssignLicence}
          />
        )}
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
