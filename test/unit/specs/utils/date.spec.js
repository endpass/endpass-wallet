import { formateDate, fromNow } from '@/utils/date';

describe('arrays utils', () => {
  describe('formateDate', () => {
    it('should formate date by YYYY-MM-DD H:mm pattern', () => {
      expect(formateDate(new Date('2016 06 12 12:40'))).toBe(
        '2016-06-12 12:40',
      );
      expect(formateDate(new Date('12:40 2018 06 12'))).toBe(
        '2018-06-12 12:40',
      );
      expect(formateDate(new Date('16:05 06 12 2017'))).toBe(
        '2017-06-12 16:05',
      );
    });
  });

  describe('fromNow', () => {
    const now = new Date();
    const testDates = [
      now.setMinutes(now.getMinutes() - 1),
      now.setHours(now.getHours() - 1),
      now.setDate(now.getDate() - 1),
      now.setMonth(now.getMonth() - 1),
      now.setYear(now.getFullYear() - 1),
    ];

    it('should returns date relative string', () => {
      expect(fromNow(testDates[0])).toBe('a minute ago');
      expect(fromNow(testDates[1])).toBe('an hour ago');
      expect(fromNow(testDates[2])).toBe('a day ago');
      expect(fromNow(testDates[3])).toBe('a month ago');
      expect(fromNow(testDates[4])).toBe('a year ago');
    });
  });
});
