import throttledQueue from 'throttled-queue';

jest.mock('throttled-queue', () => () => callback => callback());

export default throttledQueue;
