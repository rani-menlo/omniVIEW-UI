import _ from "lodash";
import { isValidPhoneNumber } from "react-phone-number-input";

const REGEX_EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isLoggedInOmniciaRole = role => _.get(role, "slug", "").includes("o_");
const isLoggedInCustomerAdmin = role => _.get(role, "slug", "") === "c_admin";
const isEmail = mail => REGEX_EMAIL.test(mail);
const isPhone = phone => isValidPhoneNumber(phone);

export { isLoggedInOmniciaRole, isLoggedInCustomerAdmin, isEmail, isPhone };
