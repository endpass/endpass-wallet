import router from '@/router';

jest.mock('@/router', () => {
  return {
    push: jest.fn(),
  };
});
export default router;
