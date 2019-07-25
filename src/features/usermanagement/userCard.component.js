import React from "react";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";
import { Avatar } from "antd";
import { ImageLoader } from "../../uikit/components";

const UserCard = ({
  user,
  onAvatarClick,
  onStatusClick,
  onEdit,
  onAssignLicenseClick
}) => {
  const isActive = _.get(user, "is_active", false);
  return (
    <div key={user.user_id} className="userManagement__group__users__user">
      <ImageLoader
        path={user.profile}
        type="circle"
        width="48px"
        height="48px"
        className="global__cursor-pointer"
        globalAccess={_.get(user, "has_global_access")}
        onClick={onAvatarClick}
      />
      {/* <Avatar size={48} icon="user" onClick={onAvatarClick} /> */}
      <div className="userManagement__group__users__user__info">
        <p className="userManagement__group__users__user__info-name">{`${_.get(
          user,
          "first_name",
          ""
        )} ${_.get(user, "last_name", "")}`}</p>
        <p className="userManagement__group__users__user__info-text">
          {translate("label.usermgmt.department")}:{" "}
          {_.get(user, "department_name", "")}
        </p>
        <p className="userManagement__group__users__user__info-text">
          {translate("label.usermgmt.subscriptionstatus")}:
          <span
            className={`userManagement__group__users__user__info-text-${
              _.get(user, "license_status", 0) ? "active" : "inactive"
            }`}
          >
            {_.get(user, "license_status", 0)
              ? ` ${translate("label.user.active")}`
              : ` ${translate("label.user.inactive")}`}
          </span>
        </p>
        {user.role_id !== 1 && (
          <p className="userManagement__group__users__user__info-text">
            {_.get(user, "license_status", 0)
              ? `${translate("label.usermgmt.expires")}: `
              : `${translate("label.usermgmt.expired")}: `}
            {getFormattedDate(_.get(user, "expiryDate")) || ""}
          </p>
        )}
        <p className="userManagement__group__users__user__info-text">
          {_.get(user, "email", "")}
        </p>
        <div className="global__center-vert">
          <p
            className="userManagement__group__users__user__info-link"
            onClick={onEdit}
          >
            {translate("label.usermgmt.edit")}
          </p>
          <div className="userManagement__group__users__user__info-dot" />
          {user.role_id !== 1 ? (
            <React.Fragment>
              <p
                className="userManagement__group__users__user__info-link"
                onClick={onAssignLicenseClick}
              >
                {translate("label.usermgmt.assignlicence")}
              </p>
              <div className="userManagement__group__users__user__info-dot" />
            </React.Fragment>
          ) : (
            ""
          )}
          <p
            className="userManagement__group__users__user__info-link"
            onClick={onStatusClick}
          >
            {isActive
              ? translate("label.usermgmt.deactivate")
              : translate("label.usermgmt.activate")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserCard);
