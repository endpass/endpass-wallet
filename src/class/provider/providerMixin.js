export default (BaseClass, ...mixins) => {
  const copyProps = (target, source) => {
    Object.getOwnPropertyNames(source)
      .concat(Object.getOwnPropertySymbols(source))
      .forEach(prop => {
        if (
          !prop.match(
            /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/,
          )
        )
          Object.defineProperty(
            target,
            prop,
            Object.getOwnPropertyDescriptor(source, prop),
          );
      });
  };

  class Base extends BaseClass {
    constructor(...args) {
      super(...args);
      mixins.forEach(Mixin => {
        copyProps(this, new Mixin());
      });

      if (this.setParent) {
        this.setParent(new BaseClass(...args));
      }
    }
  }

  mixins.forEach(mixin => {
    copyProps(Base.prototype, mixin.prototype);
    copyProps(Base, mixin);
  });

  return Base;
};
