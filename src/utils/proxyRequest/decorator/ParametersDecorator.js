export default class ParametersDecorator {
  constructor(provider) {
    this.provider = provider;
  }

  decorate(params) {
    const { url = '' } = params;
    return { ...params, url: `${this.provider.url}${url}` };
  }
}
