class BaseProvider {}

BaseProvider.prototype.send = jest.fn();
BaseProvider.prototype.sendAsync = jest.fn();

export default BaseProvider;
