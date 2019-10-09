import otpService from '@/services/otp';

jest.mock('@/services/otp', () => {
  /* eslint-disable global-require */
  const { otpSettings } = require('fixtures/accounts');

  return {
    setOtpSettings: jest.fn().mockResolvedValue({
      success: true,
    }),

    getOtpSettings: jest.fn().mockResolvedValue(otpSettings),

    deleteOtpSettings: jest.fn().mockResolvedValue({
      success: true,
    }),
  };
});

export default otpService;
