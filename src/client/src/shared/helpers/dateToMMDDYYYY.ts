export const dateToMMDDYYYY = (date: Date | string): string => {
  if (date instanceof Date) {
    // is a date
    return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
  }
  const newDate = new Date(date);
  return `${
    newDate.getMonth() + 1
  }/${newDate.getDate()}/${newDate.getFullYear()}`;
};
