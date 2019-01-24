/**
 * Chain mixins and provider class via prototype
 * @param {BaseClass} BaseClass class for apply the mixins
 * @param  {Array<Mixin>} mixins mixins take a base class and return a mixed class
 * @return {MixedClass} mixed class
 */
const applyMixinsToClass = (BaseClass, mixins) =>
  mixins.reduce((MixedClass, mixin) => mixin(MixedClass), BaseClass);

export default applyMixinsToClass;
