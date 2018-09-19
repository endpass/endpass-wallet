import throttledQueue from 'throttled-queue';

jest.mock('throttled-queue', () => {
  return function() {
    return function(callback) {
      return callback();
    };
  };
});

export default throttledQueue;
