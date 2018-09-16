import axios from 'axios';

import { identityAPIUrl } from '@/config';
import store from '@/store';

const identityConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

function handleResponseError(error) {
  const { config, response } = error;

  if (
    (!response || response.status === 401) &&
    config.url.includes(identityAPIUrl)
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
  const ignorePaths = ['auth', 'token'];
  const ignorePath = ignorePaths.some(path => config.url.includes(path));

  if (status === 200 && config.url.includes(identityAPIUrl) && !ignorePath) {
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
