export function generateStubs(Component) {
  return Object.values(Component.components).reduce((stubs, stubComponent) => {
    const dashName = stubComponent.name;

    stubs[dashName] = {
      render(createElement) {
        return createElement(dashName, this.$slots.default);
      },
    };
    return stubs;
  }, {});
}
