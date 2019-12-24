import React from "react";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { getFormattedDate } from "../../utils";
import { Avatar, Icon, Dropdown } from "antd";
import { ImageLoader } from "../../uikit/components";

const UserCard = ({
  menu,
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p
            className="userManagement__group__users__user__info-name"
            style={{ wordBreak: "break-word" }}
          >{`${_.get(user, "first_name", "")} ${_.get(
            user,
            "last_name",
            ""
          )}`}</p>
          <Dropdown
            overlay={menu(user)}
            trigger={["click"]}
            overlayClassName="maindashboard__list__item-dropdown"
          >
            <Icon
              type="down-square"
              style={{ marginRight: "10%", fontSize: "18px" }}
            />
          </Dropdown>
        </div>
        <p className="userManagement__group__users__user__info-text">
          {translate("label.usermgmt.department")}:{" "}
          {_.get(user, "department_name", "")}
        </p>

        {user.role_id !== 1 ? (
        <React.Fragment>
          <p className="userManagement__group__users__user__info-text">
            {translate("label.usermgmt.licensestatus")}:
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
        </React.Fragment> )  : (
            ""
          )}
        <p className="userManagement__group__users__user__info-text">
          {translate("label.usermgmt.accountstatus")}:
          <span
            className={`userManagement__group__users__user__info-text-${
              _.get(user, "is_active", 0) ? "active" : "inactive"
            }`}
          >
            {_.get(user, "is_active", 0)
              ? ` ${translate("label.user.active")}`
              : ` ${translate("label.user.inactive")}`}
          </span>
        </p>

        {user.role_id !== 1 ? (
        <React.Fragment>
          <p className="userManagement__group__users__user__info-text">
            {`${translate("label.usermgmt.expires")}: ${
              _.get(user, "license_status")
                ? getFormattedDate(_.get(user, "expiryDate"))
                : "N/A"
            }`}
          </p>
        </React.Fragment> )  : (
          ""
        )}
        <p className="userManagement__group__users__user__info-text">
          {_.get(user, "email", "")}
        </p>
        {/* <div className="global__center-vert">
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
        </div> */}
      </div>
    </div>
  );
};

export default React.memo(UserCard);
