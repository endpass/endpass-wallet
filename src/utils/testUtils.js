import { camelToKebab } from '@/utils';

function convertDirectivesToAttrs(directives) {
  const attrs = {};

  directives &&
    directives.forEach(({ rawName, expression }) => {
      attrs[rawName] = expression;
    });

  return attrs;
}

function convertListenersToAttrs(listeners) {
  const attrs = {};

  listeners &&
    Object.keys(listeners).forEach(key => {
      let handlers = listeners[key];

      if (!(handlers instanceof Array)) {
        handlers = [handlers];
      }

      const handler = handlers.find(h => h.name.includes('bound '));

      if (handler) {
        attrs[`v-on:${key}`] = handler.name;
      }
    });

  return attrs;
}

function convertModelToAttrs(model) {
  return model ? { 'v-model': model.expression } : {};
}

function generateElement(createElement, vnode) {
  const generateFunc = vnode.componentOptions
    ? generateElementFromComponent
    : generateElementFromHTML;

  return generateFunc(createElement, vnode);
}

function getChildrenElements(createElement, children) {
  return children
    ? children.map(child => generateElement(createElement, child))
    : undefined;
}

function generateElementFromComponent(
  createElement,
  { data, componentOptions },
) {
  const { attrs, directives, model } = data;
  const { tag, listeners, children } = componentOptions;
  const componentData = {
    ...data,
    attrs: {
      ...attrs,
      ...convertDirectivesToAttrs(directives),
      ...convertListenersToAttrs(listeners),
      ...convertModelToAttrs(model),
    },
    hook: undefined,
  };

  if (listeners) {
    componentData['on'] = Object.assign({}, listeners);
  }

  return createElement(
    tag,
    componentData,
    getChildrenElements(createElement, children),
  );
}

function generateElementFromHTML(createElement, vnode) {
  if (!vnode.data) {
    return vnode;
  }

  const { tag, data, children } = vnode;
  const { directives, on, model, attrs = {} } = data;

  return createElement(
    tag,
    {
      ...data,
      attrs: {
        ...attrs,
        ...convertDirectivesToAttrs(directives),
        ...convertListenersToAttrs(on),
        ...convertModelToAttrs(model),
      },
    },
    getChildrenElements(createElement, children),
  );
}

export function generateStubs(Component) {
  return Object.values(Component.components).reduce((stubs, stubComponent) => {
    let elementName;

    if (stubComponent.name) {
      elementName = camelToKebab(stubComponent.name);
    }

    stubs[elementName] = {
      render(createElement) {
        const subElements = Object.values(this.$slots).reduce(
          (elements, slot) =>
            elements.concat(
              slot.map(vnode => generateElement(createElement, vnode)),
            ),
          [],
        );

        // TODO: add scopedSlots support
        // TODO: add support for directives and events for the stub component
        return createElement(elementName, subElements);
      },
    };

    return stubs;
  }, {});
}
