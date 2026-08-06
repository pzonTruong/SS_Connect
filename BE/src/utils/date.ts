/**
 * Formats a Date object to a YYYY-MM-DD string in Asia/Ho_Chi_Minh (GMT+7) timezone
 */
export const getVietnamDateString = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
};

/**
 * Calculates the calendar days difference between two YYYY-MM-DD date strings (dateStr1 - dateStr2)
 */
export const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(`${dateStr1}T00:00:00+07:00`);
  const d2 = new Date(`${dateStr2}T00:00:00+07:00`);
  
  // Set both to midnight to ensure clean calendar day math
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diffTime = d1.getTime() - d2.getTime();
  // Divide by milliseconds in a day and round to nearest whole number
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};
