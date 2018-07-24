const toKebab = string =>
  string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export function generateStubs(Component) {
  return Object.values(Component.components).reduce((stubs, stubComponent) => {
    let dashName;

    if (stubComponent.name) {
      dashName = toKebab(stubComponent.name);
    }

    stubs[dashName] = {
      render(createElement) {
        return createElement(dashName, this.$slots.default);
      },
    };

    return stubs;
  }, {});
}
