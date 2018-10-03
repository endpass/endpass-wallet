import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

/**
 * Setting up dayjs globally
 */
dayjs.extend(relativeTime);

export const formateDate = date => dayjs(date).format('YYYY-MM-DD H:mm');

export const fromNow = date => dayjs(date).fromNow();

export default {
  formateDate,
  fromNow,
};
