import identityModeService from '@/services/identityMode';

jest.mock('@/services/identityMode', () => ({
  setIdentityMode: jest.fn().mockReturnValue(),

  getIdentityMode: jest.fn().mockReturnValue({ type: 'default' }),

  deleteIdentityData: jest.fn().mockResolvedValue(),
}));

export default identityModeService;
