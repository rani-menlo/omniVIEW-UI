import _ from "lodash";
import moment from "moment";
import { isValidPhoneNumber } from "react-phone-number-input";
import { DATE_FORMAT, ROLE_IDS } from "./constants";
import { translate } from "./translations/translator";

const REGEX_EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REGEX_PWD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const IMAGES = {};

const isLoggedInOmniciaRole = role => _.get(role, "slug", "").includes("o_");
const isOmniciaRole = roleName => roleName.includes("o_");
const isLoggedInCustomerAdmin = role => _.get(role, "slug", "") === "c_admin";
const isLoggedInOmniciaAdmin = role => _.get(role, "slug", "") === "o_admin";
const isLoggedInAuthor = role => _.get(role, "slug", "").includes("_author");
const isAdmin = roleName => _.includes(_.toLower(roleName), "admin");
const isEmail = mail => REGEX_EMAIL.test(mail);
const isValidPwd = pwd => REGEX_PWD.test(pwd);
const isPhone = phone => isValidPhoneNumber(phone);
const getRoleNameByRoleId = roleId => {
  let roleName = "";
  _.forEach(ROLE_IDS.CUSTOMER, (id, role) => {
    if (id === roleId) {
      roleName = role;
      return false;
    }
  });
  if (!roleName) {
    _.forEach(ROLE_IDS.OMNICIA, (id, role) => {
      if (id === roleId) {
        roleName = role;
        return false;
      }
    });
  }
  return roleName;
};
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

const getCombinedLicences = licences => {
  let combinedLicences = [];
  const licencesByName = _.groupBy(licences, "name");
  _.map(licencesByName, (licences, name) => {
    const licencesByPurchasedDate = _.groupBy(licences, "purchase_date");
    _.map(licencesByPurchasedDate, (licencesByDate, purchaseDate) => {
      const licencesByType = _.groupBy(licencesByDate, "licenceType");
      _.map(licencesByType, (typedLicences, licenceType) => {
        const licencesByExpiredDate = _.groupBy(typedLicences, "expired_date");
        _.map(licencesByExpiredDate, (licenceList, expiryDate) => {
          const diff = moment(expiryDate).diff(new Date(), "days");
          const licencesWithRevokedDate = _.groupBy(
            licenceList,
            "revoked_date"
          );
          _.map(licencesWithRevokedDate, (licenceList, revokedDate) => {
            combinedLicences.push({
              id: licenceList[0].id,
              name,
              licenceType,
              purchaseDate,
              revokedDate,
              duration: licenceList[0].duration,
              expiryDate,
              ...(diff <= 30 && { expireInDays: diff }),
              licences: licenceList
            });
          });
        });
      });
    });
  });
  combinedLicences = _.sortBy(combinedLicences, ["duration", "licenceType"]);
  return combinedLicences;
};

const getImageData = path => {
  return IMAGES[path];
};

const storeImageData = (path, data) => {
  IMAGES[path] = data;
};

const getListSequence = (sequence, array = []) => {
  array.push(sequence);
  if (_.get(sequence, "childs.length", 0)) {
    _.map(sequence.childs, seq => {
      getListSequence(seq, array);
    });
  }
  return array;
};

const getOrderedSequences = (sequences, order) => {
  let array = [];
  _.map(sequences, sequence => {
    array = array.concat(getListSequence(sequence));
  });
  const newArray = _.sortBy(array, s => Number(s.name));
  return order === "desc" ? newArray.reverse() : newArray;
};

export {
  isLoggedInOmniciaRole,
  isOmniciaRole,
  isAdmin,
  isLoggedInCustomerAdmin,
  isLoggedInOmniciaAdmin,
  isLoggedInAuthor,
  isEmail,
  isValidPwd,
  isPhone,
  getRoleName,
  getRoleNameByRoleId,
  getFormattedDate,
  getCombinedLicences,
  storeImageData,
  getOrderedSequences,
  getImageData
};
