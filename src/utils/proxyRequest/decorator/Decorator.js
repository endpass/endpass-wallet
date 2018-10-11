export default class Decorator {
  constructor(decorators = []) {
    this.setDecorators(decorators);
  }

  setDecorators(decorators) {
    this.decorators = decorators;
  }

  decorate(params = {}) {
    return this.decorators.reduce(
      (resultParams, decorator) => decorator.decorate(resultParams),
      params,
    );
  }
}
