import { START_PAGE_LOADING, STOP_PAGE_LOADING } from './mutations-types';

const startPageLoading = (state) => {
  state.isPageLoading = true;
};

const stopPageLoading = (state) => {
  state.isPageLoading = false;
};

export default {
  [START_PAGE_LOADING]: startPageLoading,
  [STOP_PAGE_LOADING]: stopPageLoading,
};
