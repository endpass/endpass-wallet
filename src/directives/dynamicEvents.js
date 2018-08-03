import Vue from 'vue';

import { kebabToCamel } from '@/utils';

Vue.directive('DynamicEvents', {
  bind: function(el, binding, vnode) {
    const allEvents = binding.value;

    allEvents.forEach(event => {
      vnode.componentInstance.$on(event, eventData => {
        const commonEventHandler = kebabToCamel(`handle-${event}`);
        const currentComponentEventHandler = kebabToCamel(
          `handle-${vnode.componentInstance.$options.name}-${event}`,
        );

        vnode.context[commonEventHandler] &&
          vnode.context[commonEventHandler](eventData);
        vnode.context[currentComponentEventHandler] &&
          vnode.context[currentComponentEventHandler](eventData);
      });
    });
  },
  unbind: function(el, binding, vnode) {
    vnode.componentInstance.$off();
  },
});
