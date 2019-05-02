import _ from "lodash";
import moment from "moment";
import { isValidPhoneNumber } from "react-phone-number-input";
import { DATE_FORMAT } from "./constants";
import { translate } from "./translations/translator";

const REGEX_EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REGEX_PWD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

const isLoggedInOmniciaRole = role => _.get(role, "slug", "").includes("o_");
const isLoggedInCustomerAdmin = role => _.get(role, "slug", "") === "c_admin";
const isLoggedInOmniciaAdmin = role => _.get(role, "slug", "") === "o_admin";
const isEmail = mail => REGEX_EMAIL.test(mail);
const isValidPwd = pwd => REGEX_PWD.test(pwd);
const isPhone = phone => isValidPhoneNumber(phone);
const getRoleName = (role, plural) => {
  role = _.toLower(role);
  if (!role) {
    return "";
  } else if (_.includes(role, "admin")) {
    return translate(`label.role.administrator${plural ? "s" : ""}`);
  } else if (_.includes(role, "publisher")) {
    return translate(`label.role.publisher${plural ? "s" : ""}`);
  } else {
    return translate(`label.role.author${plural ? "s" : ""}`);
  }
};

const getFormattedDate = date => {
  if (!date) {
    return "";
  }
  return moment(date).format(DATE_FORMAT);
};

export {
  isLoggedInOmniciaRole,
  isLoggedInCustomerAdmin,
  isLoggedInOmniciaAdmin,
  isEmail,
  isValidPwd,
  isPhone,
  getRoleName,
  getFormattedDate
};
