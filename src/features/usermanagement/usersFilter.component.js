import React from "react";
import { Text, OmniButton } from "../../uikit/components";
import { translate } from "../../translations/translator";
import _ from "lodash";
import CheckboxGroup from "antd/lib/checkbox/Group";

const sortChange = (type, callback) => () => {
  callback && callback(type);
};

const UsersFilter = ({
  roles,
  departments,
  selectedSortBy,
  selectedRoles,
  selectedDepts,
  reset,
  cancel,
  update,
  onSortChange,
  onRoleChange,
  onDeptChange,
  resetDisabled
}) => (
  <div className="userfilter">
    <Text
      type="medium"
      text={translate("label.filter.sortnamesby")}
      size="12px"
      opacity={0.5}
      className="userfilter-title"
    />
    <div className="userfilter__sortbuttons">
      <Text
        className={`userfilter__sortbuttons-bordered${
          _.includes(selectedSortBy, "first_name") ? "-colored" : ""
        }`}
        text={`${translate("label.form.fname")}, ${translate(
          "label.form.lname"
        )}`}
        size="12px"
        type="regular"
        onClick={sortChange(["first_name"], onSortChange)}
      />
      <Text
        className={`userfilter__sortbuttons-bordered${
          _.includes(selectedSortBy, "last_name") ? "-colored" : ""
        }`}
        text={`${translate("label.form.lname")}, ${translate(
          "label.form.fname"
        )}`}
        size="12px"
        type="regular"
        onClick={sortChange(["last_name"], onSortChange)}
      />
      {/* <OmniButton
        type="secondary"
        label={`${translate("label.form.fname")}, ${translate(
          "label.form.lname"
        )}`}
      />
      <OmniButton
        type="secondary"
        label={`${translate("label.form.lname")}, ${translate(
          "label.form.fname"
        )}`}
      /> */}
    </div>
    <Text
      type="medium"
      text={_.upperCase(translate("label.user.userrole"))}
      size="12px"
      opacity={0.5}
      className="userfilter-title"
    />
    <CheckboxGroup
      value={selectedRoles}
      options={roles}
      onChange={onRoleChange}
      className={`userfilter__roles ${
        _.get(roles, "length", 0) === 2 ? "userfilter__roles-justify" : ""
      }`}
    />
    <Text
      type="medium"
      text={_.upperCase(translate("label.usermgmt.department"))}
      size="12px"
      opacity={0.5}
      className="userfilter-title"
    />
    <CheckboxGroup
      value={selectedDepts}
      options={departments}
      onChange={onDeptChange}
      className="userfilter__depts"
    />
    <div className="global__center-vert userfilter__actionbuttons">
      <OmniButton
        disabled={resetDisabled}
        type="secondary"
        label={translate("label.button.resetfilters")}
        onClick={reset}
      />
      <div className="global__center-vert">
        <OmniButton
          type="secondary"
          label={translate("label.button.cancel")}
          onClick={cancel}
        />
        <OmniButton
          type="primary"
          label={translate("label.button.update")}
          buttonStyle={{ marginLeft: "16px" }}
          onClick={update}
        />
      </div>
    </div>
  </div>
);

export default UsersFilter;
