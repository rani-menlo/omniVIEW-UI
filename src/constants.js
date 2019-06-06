import { translate } from "./translations/translator";

const path = "/api/v1/";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const ROLE_IDS = {
  OMNICIA: {
    administrator: 1,
    author: 3,
    publisher: 2
  },
  CUSTOMER: {
    administrator: 4,
    author: 6,
    publisher: 5
  }
};

const ROLES = {
  OMNICIA: [
    {
      name: translate("label.role.administrator"),
      id: ROLE_IDS.OMNICIA.administrator
    },
    { name: translate("label.role.author"), id: ROLE_IDS.OMNICIA.author },
    { name: translate("label.role.publisher"), id: ROLE_IDS.OMNICIA.publisher }
  ],
  CUSTOMER: [
    {
      name: translate("label.role.administrator"),
      id: ROLE_IDS.CUSTOMER.administrator
    },
    { name: translate("label.role.author"), id: ROLE_IDS.CUSTOMER.author },
    { name: translate("label.role.publisher"), id: ROLE_IDS.CUSTOMER.publisher }
  ]
};

const CHECKBOX = {
  SELECTED: 1,
  DESELECTED: 0,
  SELECTED_PARTIALLY: -1,
  RESET_DEFAULT: 100
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
  GET_SEQUENCES_WITH_PERMISSIONS: `${path}sequence/getSequences`,
  // Validation
  VALIDATE_SEQUENCE: `${path}validation/sequenceValidation`,
  // User
  PROFILE_IMAGE: `${path}user/getProfileImage`,
  GET_USERS: `${path}user/getUsers`,
  ADD_USER: `${path}user/addUsers`,
  UPDATE_USER: `${path}user/updateUsers`,
  CREATE_UPDATE_PROFILE: `${path}user/updateProfile`,
  ACTIVATE_DEACTIVATE: `${path}user/activateOrDeactivateUser`,
  // File
  GET_FILE_SIZE: `${path}file/getFileSize`,
  GET_JSON: `${path}file/getFile`,
  GET_JSON_WITH_PERMISSION: `${path}file/getSequenceJsonFile`,
  GET_NEW_PATH: `${path}file/getNewPath`,
  GET_RESOURCE_FILE: `${path}file/getResourceFile`,
  // acces
  ASSIGN_FILE_PERMISSIONS: `${path}access/assignFilePermissions`,
  ASSIGN_SUBMISSION_PERMISSIONS: `${path}access/assignSubmissionPermissions`,
  ASSIGN_SEQUENCE_PERMISSIONS: `${path}access/assignSequencePermissions`,
  GET_USERS_OF_SUBMISSIONS: `${path}access/getSubmissionAccessedUsers`,
  GET_USERS_OF_FILES: `${path}access/getFolderAccessedUsers`,
  ASSIGN_FOLDER_PERMISSIONS: `${path}access/assignFolderPermissions`,
  ASSIGN_GLOBAL_PERMISSIONS: `${path}access/updateGlobalPermissions`
};

const DATE_FORMAT = "MM/DD/YYYY";
const DEBOUNCE_TIME = 700; //ms

const VIEWER = {
  GOOGLE_VIEWER_MAX_SIZE: 22 * 1024 * 1024, // 22MB
  OFFICE_VIEWER_MAX_SIZE: 10 * 1024 * 1024 // 10MB
};

const IMAGE_SUPPORT_TYPES = ".JPG, .JPEG, .PNG";

export {
  URI,
  SERVER_URL,
  DATE_FORMAT,
  VIEWER,
  DEBOUNCE_TIME,
  ROLES,
  ROLE_IDS,
  CHECKBOX,
  IMAGE_SUPPORT_TYPES
};
