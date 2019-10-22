import React from "react";
import moment from "moment";
import _ from "lodash";
import { translate } from "../../translations/translator";
import { Text, ImageLoader, OmniButton } from "../../uikit/components";
import { Modal, Table } from "antd";
import { getFormattedDate } from "../../utils";

const Columns = [
  {
    title: translate("label.dashboard.user"),
    dataIndex: "name",
    key: "name",
    render: (text, user) => (
      <div className="global__center-vert">
        <ImageLoader
          type="circle"
          path={_.get(user, "profile", null)}
          width="35px"
          height="35px"
          style={{ marginRight: "10px" }}
        />
        <Text
          type="regular"
          size="14px"
          text={`${_.get(user, "first_name", "")} ${_.get(
            user,
            "last_name",
            ""
          )}`}
        />
      </div>
    ),
    width: 200
  },
  {
    title: translate("label.user.status"),
    dataIndex: "status",
    key: "status",
    render: (text, user) => (
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
      />
    ),
    width: 100
  },
  {
    title: translate("label.licence.expirationdate"),
    dataIndex: "expirationdate",
    key: "expirationdate",
    render: (text, user) => (
      <Text
        type="medium"
        size="12px"
        text={
          (_.get(user, "license_status", 0) &&
            getFormattedDate(_.get(user, "expiryDate"))) ||
          "-"
        }
      />
    ),
    width: 150
  }
];

const AssignLicence = ({
  closeModal,
  licence,
  users,
  visible,
  submit,
  back
}) => {
  const singleUser = !_.isArray(users) || _.get(users, "length") === 1;
  const user = singleUser && (_.isArray(users) ? users[0] : users);
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
        text={
          singleUser
            ? translate("text.licence.areyousuretoassign")
            : translate("text.licence.areyousuretoassignmultiple")
        }
      />
      {!singleUser && (
        <React.Fragment>
          <Text
            type="medium"
            size="14px"
            text={`${_.get(licence, "licenceType", "") ||
              _.get(licence, "type_name", "")} - ${_.get(licence, "name", "")}`}
            textStyle={{ marginTop: "20px" }}
          />
          <Text
            type="regular"
            size="14px"
            text={`${translate("label.generic.purchasedon", {
              date: getFormattedDate(
                _.get(licence, "purchaseDate", null) ||
                  _.get(licence, "purchase_date", "")
              )
            })}`}
          />
          <Text
            type="regular"
            size="14px"
            text={translate("text.licence.accesspermitteduntil", {
              date: moment(
                _.get(licence, "purchaseDate", null) ||
                  _.get(licence, "purchase_date", "")
              )
                .add(_.get(licence, "duration", 0), "days")
                .calendar()
            })}
          />
          <Table
            columns={Columns}
            dataSource={users}
            pagination={false}
            scroll={{ y: 200 }}
            style={{ marginTop: "20px" }}
          />
        </React.Fragment>
      )}
      {singleUser && (
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
                  )}`} ${getFormattedDate(_.get(user, "expired_date"))}`}
                textStyle={{ display: "inline" }}
              />
            </div>
          </div>
          <Text
            type="regular"
            size="14px"
            text={translate("text.licence.accesspermitteduntil", {
              date: moment(
                _.get(licence, "purchaseDate", null) ||
                  _.get(licence, "purchase_date", "")
              )
                .add(_.get(licence, "duration", 0), "days")
                .calendar()
            })}
          />
        </div>
      )}
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
