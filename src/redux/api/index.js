import axios from "axios";
import { requestInterceptor } from "./request.interceptor";
import { default as LoginApi } from "./login.api";
import { default as CustomerApi } from "./customer.api";
import { default as ApplicationApi } from "./application.api";
import { default as SubmissionApi } from "./submission.api";
import { SERVER_URL } from "../../constants";

const api = axios.create({
  baseURL: SERVER_URL
});

api.interceptors.request.use(requestInterceptor);

export default api;
export { LoginApi, CustomerApi, ApplicationApi, SubmissionApi };
