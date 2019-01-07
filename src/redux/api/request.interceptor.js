const requestInterceptor = reqConfig => {
  try {
    let token = localStorage.getItem("token");
    reqConfig.headers = {
      ...reqConfig.headers,
      "x-auth-token": token
    };
    return reqConfig;
  } catch (error) {
    return Promise.reject(error);
  }
};

export { requestInterceptor };
