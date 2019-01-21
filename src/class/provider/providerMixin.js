export default (BaseClass, ...mixins) => {
  let mix = superclass => new MixinBuilder(superclass);

  class MixinBuilder {
    constructor(superclass) {
      this.superclass = superclass;
    }

    with(mixins) {
      return mixins.reduce((c, mixin) => mixin(c), this.superclass);
    }
  }
  return class Base extends mix(BaseClass).with(mixins) {
    constructor(...args) {
      super(...args);
    }
  };
};
