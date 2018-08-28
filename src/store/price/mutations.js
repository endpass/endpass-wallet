import {
  SET_PRICE,
  SET_UPDATE_TIME,
  START_LOADING,
  STOP_LOADING,
  SET_INTERVAL,
} from './mutations-types.js';

const setPrice = (state, price) => {
  state.price = price;
};

const setUpdateTime = (state, updateTime) => {
  state.updateTime = updateTime;
};

const startLoading = state => {
  state.isLoading = true;
};

const stopLoading = state => {
  state.isLoading = false;
};

const setInterval = (state, interval) => {
  state.interval = interval;
};

export default {
  SET_PRICE: setPrice,
  SET_UPDATE_TIME: setUpdateTime,
  START_LOADING: startLoading,
  STOP_LOADING: stopLoading,
  SET_INTERVAL: setInterval,
};
