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
  LOGOUT: `${path}auth/logout`,
  OTP: `${path}auth/otpgeneration`,
  OTP_VERIFY: `${path}auth/otpverification`,
  FORGOT_PWD: `${path}auth/forgotPassword`,
  RESET_PWD: `${path}auth/resetPassword/:key`,
  RESET_PWD_LINK_EXPIRY: `${path}auth/checkPasswordExpiry`,

  // Customer
  GET_CUSTOMER: `${path}customer/getCustomerByID/:customerId`,
  ADD_CUSTOMER: `${path}customer/createCustomer`,
  EDIT_CUSTOMER: `${path}customer/editCustomer`,
  ACTIVATE_DEACTIVATE_CUSTOMER: `${path}customer/activateOrDeactivateCustomer`,
  GET_CUSTOMERS: `${path}customer/getCustomers`,
  GET_DEPARTMENTS: `${path}customer/getDepartments`,
  GET_AVAILABLE_LICENCES: `${path}customer/getAvailableLicences`,
  GET_ALL_LICENCES: `${path}customer/getAllLicences/:customer_id`,
  GET_SUBSCRIPTIONS_IN_USE: `${path}customer/getSubscriptionsInUse`,
  GET_LICENCE_LOOKUP_INFO: `${path}customer/licenceLookupInfo`,
  ADD_NEW_LICENCES: `${path}customer/addLicences`,

  // Submission
  GET_APPLICATIONS: `${path}submission/getSubmissions`,
  DELETE_SUBMISSION: `${path}submission/deleteSubmission`,

  GET_SUBMISSION_CENTERS: `${path}submission/getSubmissionCenters`,
  UPDATE_SUBMISSION_CENTER: `${path}submission/updateSubmissionCenter`,

  // Sequence
  GET_SEQUENCES: `${path}sequence/getSequences`,
  GET_SEQUENCES_WITH_PERMISSIONS: `${path}sequence/getSequences`,

  // Validation
  VALIDATE_SEQUENCE: `${path}validation/sequenceValidation`,
  VALIDATION_REPORT: `${path}validation/generateValidationReport?id={sequenceId}&authToken={authToken}`,

  // User
  PROFILE_IMAGE: `${path}user/getProfileImage`,
  GET_USERS: `${path}user/getUsers`,
  ADD_USER: `${path}user/addUsers`,
  UPDATE_USER: `${path}user/updateUsers`,
  DELETE_USER: `${path}user/deleteUsers`,
  CREATE_UPDATE_PROFILE: `${path}user/updateProfile`,
  ACTIVATE_DEACTIVATE: `${path}user/activateOrDeactivateUser`,
  UPDATE_SECONDARY_CONTACTS: `${path}user/updateSecondaryContacts`,
  ASSIGN_LICENSE: `${path}user/assignLicense`,
  REVOKE_LICENSE: `${path}user/revokeLicense`,
  REQUEST_LICENSE: `${path}user/requestLicense`,
  GET_LICENSE_INFO: `${path}user/getLicenseInfo`,
  RESEND_INVITATION_MAIL: `${path}user/resendInvitationMail`,

  // File
  GET_FILE_SIZE: `${path}file/getFileSize`,
  GET_JSON: `${path}file/getFile`,
  GET_JSON_WITH_PERMISSION: `${path}file/getSequenceJsonFile`,
  GET_NEW_PATH: `${path}file/getNewPath`,
  GET_RESOURCE_FILE: `${path}file/getResourceFile`,
  FIND_TEXT: `${path}file/findText`,

  // access
  ASSIGN_FILE_PERMISSIONS: `${path}access/assignFilePermissions`,
  ADD_APPLICATION: `${path}access/checkAddApplicationAccess`,
  ASSIGN_SUBMISSION_PERMISSIONS: `${path}access/assignSubmissionPermissions`,
  ASSIGN_SEQUENCE_PERMISSIONS: `${path}access/assignSequencePermissions`,
  GET_USERS_OF_SUBMISSIONS: `${path}access/getSubmissionAccessedUsers`,
  GET_USERS_OF_FILES: `${path}access/getFolderAccessedUsers`,
  ASSIGN_FOLDER_PERMISSIONS: `${path}access/assignFolderPermissions`,
  ASSIGN_GLOBAL_PERMISSIONS: `${path}access/updateGlobalPermissions`,
  GET_ACCESSED_CUSTOMERS: `${path}access/getUserAccessedCustomers`,
  GET_ACCESSED_SUBMISSIONS: `${path}access/getAccessedSubmissions`,
  UPDATE_PERMISSIONS: `${path}access/updatePermissions`,

  //upload
  SAVE_FTP_DETAILS: `${path}upload/checkAndSaveFTPDetails`,
  GET_FTP_DETAILS: `${path}upload/getSavedFTPDetails/{customerId}`,
  GET_FTP_CONTENTS: `${path}upload/getContentsOfFTPPath`,
  IS_VALID_FOLDER: `${path}upload/isValidFTPSubmissionFolder`,
  IS_VALID_SEQUENCE_FOLDER: `${path}upload/isValidFTPSequenceFolder`,
  SUBMISSION_LOOKUP_INFO: `${path}upload/submissionLookUpInfo`,
  SAVE_SUBMISSION_DETAILS: `${path}upload/saveSubmissionDetails`,
  SAVE_SEQUENCE_DETAILS: `${path}upload/saveSequenceDetails`,
  MONITOR_STATUS: `${path}upload/monitorStatus`,
  RETRY_UPLOADS: `${path}upload/retrySequence`
};

const DATE_FORMAT = "MM/DD/YYYY";
const DEBOUNCE_TIME = 700; //ms
const POLLING_INTERVAL = 10000; //ms
const UPLOAD_INPROGRES = 0;
const UPLOAD_INPROGRES_EXTRA = -1;  // added extra from the backend
const UPLOAD_FAILED = 1;
const UPLOAD_SUCCESS = 2;
const ANALYZING = 3;
const UPLOAD_PROCESSING = 3;

const VIEWER = {
  GOOGLE_VIEWER_MAX_SIZE: 22 * 1024 * 1024, // 22MB
  OFFICE_VIEWER_MAX_SIZE: 10 * 1024 * 1024 // 10MB
};

const IMAGE_SUPPORT_TYPES = ".JPG, .JPEG, .PNG";

/* This data hardcoded from valid-values.xml file which we got from legacy application.
It has full bulk data of strings(titles), these titles appear inside STF files as folder names.
These folder names should follow order as in the valid-values.xml. 
valid-values.xml follows ascending order but somehow below titles are pushed to top/bottom without any logic
hence we are following the same by taking these values to push top/bottom after ascending order */
const VALID_VALUES_XML_DATA = {
  BOTTOM_LIST: [
    "Complete Patient List",
    "List of Patients Having Abnormal Lab Values",
    "List of Patients Having Adverse Events",
    "List of Patients Having Serious Adverse Events"
  ],
  TOP_LIST: ["Synopsis"]
};

const CLOUDS = {
  ftp: {
    name: "FTP",
    disabled: false
  },
  oneDrive: {
    name: "ONE DRIVE",
    disabled: true
  },
  box: {
    name: "BOX",
    disabled: true
  }
};

export {
  URI,
  SERVER_URL,
  DATE_FORMAT,
  VIEWER,
  DEBOUNCE_TIME,
  POLLING_INTERVAL,
  UPLOAD_INPROGRES,
  UPLOAD_INPROGRES_EXTRA,
  UPLOAD_FAILED,
  UPLOAD_SUCCESS,
  ANALYZING,
  UPLOAD_PROCESSING,
  ROLES,
  ROLE_IDS,
  CHECKBOX,
  IMAGE_SUPPORT_TYPES,
  VALID_VALUES_XML_DATA,
  CLOUDS
};
