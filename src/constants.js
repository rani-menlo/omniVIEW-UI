const path = "/api/v1/";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
// const SERVER_URL = "http://192.168.1.44:3000";
// const SERVER_URL = "https://omniciastage.azurewebsites.net";
// const SERVER_URL = "https://omniciadev.azurewebsites.net";

const URI = {
  LOGIN: `${path}login`,
  OTP: `${path}otpgeneration`,
  OTP_VERIFY: `${path}otpverification`,
  GET_CUSTOMERS: `${path}getCustomers`,
  GET_APPLICATIONS: `${path}submissions`,
  GET_SEQUENCES: `${path}sequences`,
  GET_JSON: `${path}getFile`,
  GET_RESOURCE_FILE: `${path}getResourceFile`,
  VALIDATE_SEQUENCE: `${path}sequenceValidation`,
  GET_FILE_SIZE: `${path}getFileSize`,
  GET_NEW_PATH: `${path}getNewPath`
};

const DATE_FORMAT = "MM/DD/YYYY";

const VIEWER = {
  GOOGLE_VIEWER_MAX_SIZE: 22 * 1024 * 1024, // 22MB
  OFFICE_VIEWER_MAX_SIZE: 10 * 1024 * 1024 // 10MB
};

export { URI, SERVER_URL, DATE_FORMAT, VIEWER };
