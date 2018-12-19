import authService from '@/services/auth';

jest.mock('@/services/auth', () => ({
  login: jest.fn().mockResolvedValue('email_auth'),

  logout: jest.fn().mockResolvedValue({ success: true }),

  loginViaOTP: jest.fn().mockResolvedValue({ success: true }),
}));

export default authService;
