import axios from 'axios';

import { REQUEST_TIMEOUT_MSEC } from '@/constants';

const config = {
  timeout: REQUEST_TIMEOUT_MSEC,
};

export default axios.create(config);
