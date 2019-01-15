import authService from '@/services/auth';

jest.mock('@/services/auth', () => ({
  login: jest.fn().mockResolvedValue('emailAuth'),

  logout: jest.fn().mockResolvedValue({ success: true }),

  loginViaOTP: jest.fn().mockResolvedValue({ success: true }),
}));

export default authService;
