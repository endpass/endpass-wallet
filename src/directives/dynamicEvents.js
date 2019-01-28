import { camelCase } from 'lodash';

function dynamicEvents(Vue) {
  Vue.directive('DynamicEvents', {
    bind(el, binding, vnode) {
      const allEvents = binding.value;

      allEvents.forEach(event => {
        vnode.componentInstance.$on(event, eventData => {
          const commonEventHandler = camelCase(`handle-${event}`);
          const currentComponentEventHandler = camelCase(
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
}

export default dynamicEvents;
