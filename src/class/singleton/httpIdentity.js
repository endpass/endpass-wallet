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

const createHandlerResponseError = storeInstance => (error) => {
  const { config, response } = error;
  const storeLink = storeInstance || store;

  if (
    (!response || response.status === 401)
    && config.url.includes(ENV.VUE_APP_IDENTITY_API_URL)
  ) {
    const isLoggedIn = storeLink.getters['user/isLoggedIn'];

    storeLink.dispatch({
      type: 'user/setAuthorizationStatus',
      authorizationStatus: false,
    });

    if (isLoggedIn) {
      storeLink.dispatch({
        type: 'user/logout',
      });
    }
  }

  return Promise.reject(error);
};

const createHandleResponseSuccess = storeInstance => (response) => {
  const { config, status } = response;
  const storeLink = storeInstance || store;

  const ignorePaths = ['auth'];
  const ignorePath = ignorePaths.some(path => config.url.includes(path));
  if (
    status === 200
    && config.url.includes(ENV.VUE_APP_IDENTITY_API_URL)
    && !ignorePath
  ) {
    storeLink.dispatch({
      type: 'user/setAuthorizationStatus',
      authorizationStatus: true,
    });
  }

  return response;
};

export function createAxiosInstance(storeInstance = store) {
  const instance = axios.create(identityConfig);

  instance.interceptors.response.use(
    createHandleResponseSuccess(storeInstance),
    createHandlerResponseError(storeInstance),
  );

  return instance;
}

export default createAxiosInstance();
