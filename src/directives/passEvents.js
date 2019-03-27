function passEvents(Vue) {
  Vue.directive('PassEvents', {
    bind(el, binding, vnode) {
      const allEvents = binding.value;

      Object.keys(allEvents).forEach((event) => {
        const handlers = allEvents[event];
        const isSingle = typeof handlers === 'string';

        vnode.componentInstance.$on(event, (eventData) => {
          const handlerName = isSingle
            ? handlers
            : handlers[vnode.componentInstance.$options.name];

          if (vnode.context[handlerName]) {
            vnode.context[handlerName](eventData);
          }
        });
      });
    },
    unbind(el, binding, vnode) {
      vnode.componentInstance.$off();
    },
  });
}

export default passEvents;
