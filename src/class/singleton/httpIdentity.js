import axios from 'axios';

import { REQUEST_TIMEOUT_MSEC } from '@/constants';
import store from '@/store';

const identityConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: REQUEST_TIMEOUT_MSEC,
};

function handleResponseError(error) {
  const { config, response } = error;

  if (
    (!response || response.status === 401) &&
    config.url.includes(ENV.identityAPIUrl)
  ) {
    store.dispatch({
      type: 'user/setAuthorizationStatus',
      authorizationStatus: false,
    });
  }

  return Promise.reject(error);
}

function handleResponseSuccess(response) {
  const { config, status } = response;
  const ignorePaths = ['auth'];
  const ignorePath = ignorePaths.some(path => config.url.includes(path));

  if (
    status === 200 &&
    config.url.includes(ENV.identityAPIUrl) &&
    !ignorePath
  ) {
    store.dispatch({
      type: 'user/setAuthorizationStatus',
      authorizationStatus: true,
    });
  }

  return response;
}

function createAxiosInstance() {
  const instance = axios.create(identityConfig);

  instance.interceptors.response.use(
    handleResponseSuccess,
    handleResponseError,
  );

  return instance;
}

export default createAxiosInstance();
