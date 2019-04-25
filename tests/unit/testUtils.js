// :todo move to core/utils after done tests

import { shallowMount, mount } from '@vue/test-utils';

function createComputed(options = {}) {
  const computed = Object.keys(options).reduce((map, key) => {
    // eslint-disable-next-line no-param-reassign
    map[key] = function() {
      return options[key];
    };
    return map;
  }, {});
  return computed;
}

const mountFactory = mounter => (cmp, options = {}) => (newOptions = {}) => {
  const computed = createComputed({
    ...options.computed,
    ...newOptions.computed,
  });
  const wrapper = mounter(cmp, {
    ...options,
    ...newOptions,
    computed,
  });
  return wrapper;
};

const wrapMountFactory = mountFactory(mount);
const wrapShallowMountFactory = mountFactory(shallowMount);

export { wrapShallowMountFactory, wrapMountFactory };
