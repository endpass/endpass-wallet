import Vue from 'vue';
import { toCamel } from '@/utils/strings';

Vue.directive('DynamicEvents', {
  bind(el, binding, vnode) {
    const allEvents = binding.value;

    allEvents.forEach(event => {
      vnode.componentInstance.$on(event, eventData => {
        const commonEventHandler = toCamel(`handle-${event}`);
        const currentComponentEventHandler = toCamel(
          `handle-${vnode.componentInstance.$options.name}-${event}`,
        );

        if (vnode.context[commonEventHandler]) {
          vnode.context[commonEventHandler](eventData);
        }

        if (vnode.context[currentComponentEventHandler]) {
          vnode.context[currentComponentEventHandler](eventData);
        }
      });
    });
  },
  unbind(el, binding, vnode) {
    vnode.componentInstance.$off();
  },
});
