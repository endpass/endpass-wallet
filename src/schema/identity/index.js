import userToken from './token';
import userNetwork from './network';
import userSettings from './settings';
import userOtpSetting from './otp';

export default {
  ...userToken,
  ...userNetwork,
  ...userSettings,
  ...userOtpSetting,
};
