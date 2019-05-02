import React from "react";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";
import { Avatar } from "antd";

const UserCard = ({ user, onAvatarClick, onStatusClick, onEdit }) => {
  const isActive = _.get(user, "is_active", false);
  return (
    <div key={user.user_id} className="userManagement__group__users__user">
      <Avatar
        size={48}
        icon="user"
        onClick={onAvatarClick}
        className="global__cursor-pointer"
      />
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
              isActive ? "active" : "inactive"
            }`}
          >
            {isActive
              ? ` ${translate("label.user.active")}`
              : ` ${translate("label.user.inactive")}`}
          </span>
        </p>
        {user.role_id !== 1 && (
          <p className="userManagement__group__users__user__info-text">
            {isActive
              ? `${translate("label.usermgmt.expires")}: `
              : `${translate("label.usermgmt.expired")}: `}
            {getFormattedDate(_.get(user, "expired_date")) || ""}
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
                style={{ cursor: "not-allowed", opacity: 0.5 }}
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
