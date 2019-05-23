import axios from "axios";
import { requestInterceptor } from "./request.interceptor";
import { default as LoginApi } from "./login.api";
import { default as CustomerApi } from "./customer.api";
import { default as ApplicationApi } from "./application.api";
import { default as SubmissionApi } from "./submission.api";
import { default as UsermanagementApi } from "./usermanagement.api";
import { default as ImageApi } from "./image.api";
import { SERVER_URL } from "../../constants";
import { responseInterceptor } from "./response.interceptor";

const api = axios.create({
  baseURL: SERVER_URL
});

api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(null, responseInterceptor);

export default api;
export {
  LoginApi,
  CustomerApi,
  ApplicationApi,
  SubmissionApi,
  UsermanagementApi,
  ImageApi
};
