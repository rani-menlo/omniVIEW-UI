import _ from "lodash";
import moment from "moment";
import { isValidPhoneNumber } from "react-phone-number-input";
import {
  DATE_FORMAT,
  ROLE_IDS,
  OPENED_WINDOWS,
  APPLICATION_TYPES,
} from "./constants";
import { translate } from "./translations/translator";

const REGEX_EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REGEX_PWD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const IMAGES = {};
const MIN_FOUR_DIGITS = /^[0-9]{4}$/;

const isLoggedInOmniciaRole = (role) => _.get(role, "slug", "").includes("o_");
const isOmniciaRole = (roleName) => roleName.includes("o_");
const isLoggedInCustomerAdmin = (role) => _.get(role, "slug", "") === "c_admin";
const isLoggedInOmniciaAdmin = (role) => _.get(role, "slug", "") === "o_admin";
const isLoggedInAuthor = (role) => _.get(role, "slug", "").includes("_author");
const isAdmin = (roleName) => _.includes(_.toLower(roleName), "admin");
const isEmail = (mail) => REGEX_EMAIL.test(mail);
const isValidPwd = (pwd) => REGEX_PWD.test(pwd);
const isPhone = (phone) => isValidPhoneNumber(phone);
const getRoleNameByRoleId = (roleId) => {
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

const getFormattedDate = (date) => {
  if (!date) {
    return "";
  }
  return moment(date).format(DATE_FORMAT);
};

/**
 * return true if the date is todays date
 * @param {*} date
 */
const isToday = (date) => {
  return moment(date).isSame(moment(), "day");
};

const getCombinedLicences = (licences) => {
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
              licences: licenceList,
            });
          });
        });
      });
    });
  });
  combinedLicences = _.sortBy(combinedLicences, ["duration", "licenceType"]);
  return combinedLicences;
};

const getImageData = (path) => {
  return IMAGES[path];
};

const storeImageData = (path, data) => {
  IMAGES[path] = data;
};

const getListSequence = (sequence, array = []) => {
  array.push(sequence);
  if (_.get(sequence, "childs.length", 0)) {
    _.map(sequence.childs, (seq) => {
      getListSequence(seq, array);
    });
  }
  return array;
};

const getOrderedSequences = (sequences, order) => {
  let array = [];
  _.map(sequences, (sequence) => {
    array = array.concat(getListSequence(sequence));
  });
  const newArray = _.sortBy(array, (s) => Number(s.name));
  return order === "desc" ? newArray.reverse() : newArray;
};

const minFourDigitsInString = (val) => {
  return MIN_FOUR_DIGITS.test(val);
};

//get DTD version, (Jira ticket OMNG-764, Sprint-23)
const getDTDVersion = (m1Json) => {
  return m1Json && m1Json["dtd-version"] ? m1Json["dtd-version"] : "";
};

//get DTD 2.01 version date, (Jira ticket OMNG-764, Sprint-23)
const getV2_2Date = (m1Json) => {
  const submissionDate = _.get(
    m1Json,
    "[admin][applicant-info][date-of-submission][date]"
  );
  const submission_date = getDTD2_2_FormattedDate(
    _.get(submissionDate, "[$t]", ""),
    _.get(submissionDate, "[format]", "")
  );
  return submission_date;
};

//get DTD 2.01 version date format, (Jira ticket OMNG-764, Sprint-23)
const getDTD2_2_FormattedDate = (date, format) => {
  format = format == "yyyymmdd" ? "YYYY.MM.DD" : format;
  let dateFormat = format ? format.toUpperCase() : "YYYY.MM.DD";
  if (!date) {
    return "";
  }
  return moment(date).format(dateFormat);
};

const openFileInWindow = (fileHref, fileID, title) => {
  let type = "";
  let url = "";
  if (fileHref) {
    type = fileHref.substring(fileHref.lastIndexOf(".") + 1);
  }
  if (type.includes("pdf") && fileID) {
    url = `${process.env.PUBLIC_URL}/viewer/pdf/${fileID}`;
  } else {
    if (fileID) {
      url = `${process.env.PUBLIC_URL}/viewer/${type}/${fileID}`;
    }
  }
  let openedWindow = OPENED_WINDOWS[url];
  if (!openedWindow) {
    openedWindow = window.open(url, "_blank");
    OPENED_WINDOWS[url] = openedWindow;
    openedWindow.onbeforeunload = function() {
      OPENED_WINDOWS[url] = null;
    };
    openedWindow.addEventListener("load", function() {
      openedWindow.document.title = title || "";
    });
  }
  openedWindow.focus();
};

/**
 * Checking the application folder name from the list of application types for site to site connector
 * (For ref. - Story OMNG-1100, Sprint-32)
 * @param {String} folderName
 */
const validatingApplicationFolderNames = (folderName) => {
  let valid = false;
  _.forEach(APPLICATION_TYPES, (type) => {
    valid = new RegExp(type).test(folderName);
    //Returning if the folder name matches with the list of application types
    if (valid) {
      return false;
    }
  });
  return valid;
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
  isToday,
  getCombinedLicences,
  storeImageData,
  getOrderedSequences,
  getImageData,
  minFourDigitsInString,
  getDTDVersion,
  getDTD2_2_FormattedDate,
  getV2_2Date,
  openFileInWindow,
  validatingApplicationFolderNames,
};
