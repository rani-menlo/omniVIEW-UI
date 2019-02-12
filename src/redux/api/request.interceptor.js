const requestInterceptor = reqConfig => {
  try {
    let token = localStorage.getItem('omniview_user_token');
    reqConfig.headers = {
      ...reqConfig.headers,
      'x-auth-token': token
    };
    return reqConfig;
  } catch (error) {
    return Promise.reject(error);
  }
};

export { requestInterceptor };
