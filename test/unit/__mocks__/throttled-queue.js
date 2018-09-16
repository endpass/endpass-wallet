import throttledQueue from 'throttled-queue';

jest.mock('throttled-queue', () => {
  return function() {
    return function(callback) {
      // console.log('kek')
      return callback();
    };
  };
});

export default throttledQueue;
