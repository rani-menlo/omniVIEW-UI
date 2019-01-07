import axios from "axios";
import { requestInterceptor } from "./request.interceptor";
import { default as LoginApi } from "./login.api";
import { default as CustomerApi } from "./customer.api";
import { default as ApplicationApi } from "./application.api";

const server = "http://192.168.1.44:3000";

const api = axios.create({
  baseURL: server
});

api.interceptors.request.use(requestInterceptor);

export default api;
export { LoginApi, CustomerApi, ApplicationApi };
