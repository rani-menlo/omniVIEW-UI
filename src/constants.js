import { translate } from "./translations/translator";

const path = "/api/v1/";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const ROLES = {
  OMNICIA: [
    { name: translate("label.role.administrator"), id: 1 },
    { name: translate("label.role.author"), id: 3 },
    { name: translate("label.role.publisher"), id: 2 }
  ],
  CUSTOMER: [
    { name: translate("label.role.administrator"), id: 4 },
    { name: translate("label.role.author"), id: 6 },
    { name: translate("label.role.publisher"), id: 5 }
  ]
};

const URI = {
  // Auth
  LOGIN: `${path}auth/login`,
  OTP: `${path}auth/otpgeneration`,
  OTP_VERIFY: `${path}auth/otpverification`,
  // Customer
  ADD_CUSTOMER: `${path}customer/createCustomer`,
  EDIT_CUSTOMER: `${path}customer/editCustomer`,
  ACTIVATE_DEACTIVATE_CUSTOMER: `${path}customer/activateOrDeactivateCustomer`,
  GET_CUSTOMERS: `${path}customer/getCustomers`,
  GET_DEPARTMENTS: `${path}customer/getDepartments`,
  GET_LICENCES: `${path}customer/getAvailableLicences`,
  GET_ALL_LICENCES: `${path}customer/getAllLicences`,
  // Submission
  GET_APPLICATIONS: `${path}submission/getSubmissions`,
  // Sequence
  GET_SEQUENCES: `${path}sequence/getSequences`,
  // Validation
  VALIDATE_SEQUENCE: `${path}validation/sequenceValidation`,
  // User
  GET_USERS: `${path}user/getUsers`,
  ADD_USER: `${path}user/addUsers`,
  UPDATE_USER: `${path}user/updateUsers`,
  CREATE_UPDATE_PROFILE: `${path}user/updateProfile`,
  ACTIVATE_DEACTIVATE: `${path}user/activateOrDeactivateUser`,
  // File
  GET_FILE_SIZE: `${path}file/getFileSize`,
  GET_JSON: `${path}file/getFile`,
  GET_NEW_PATH: `${path}file/getNewPath`,
  GET_RESOURCE_FILE: `${path}file/getResourceFile`
};

const DATE_FORMAT = "MM/DD/YYYY";
const DEBOUNCE_TIME = 700; //ms

const VIEWER = {
  GOOGLE_VIEWER_MAX_SIZE: 22 * 1024 * 1024, // 22MB
  OFFICE_VIEWER_MAX_SIZE: 10 * 1024 * 1024 // 10MB
};

export { URI, SERVER_URL, DATE_FORMAT, VIEWER, DEBOUNCE_TIME, ROLES };
