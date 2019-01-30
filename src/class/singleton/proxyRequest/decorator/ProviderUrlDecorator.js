export default class ProviderUrlDecorator {
  constructor(url) {
    this.url = url;
  }

  decorate(params) {
    const { url = '' } = params;
    return { ...params, url: `${this.url}${url}` };
  }
}
