const path = "/api/v1/";

const SERVER_URL = "http://192.168.1.44:3000";

const URI = {
  LOGIN: `${path}login`,
  OTP: `${path}otpgeneration`,
  OTP_VERIFY: `${path}otpverification`,
  GET_CUSTOMERS: `${path}getCustomers`,
  GET_APPLICATIONS: `${path}submissions`,
  GET_SEQUENCES: `${path}sequences`,
  GET_JSON: `${path}getFile`,
  GET_RESOURCE_FILE: `${path}getResourceFile`
};

export { URI, SERVER_URL };
