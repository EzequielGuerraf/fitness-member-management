const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const parseDateOnly = (value: string): Date => {
  if (!ISO_DATE_ONLY_PATTERN.test(value)) {
    throw new Error(`Invalid date-only value: ${value}`);
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date-only value: ${value}`);
  }

  return parsedDate;
};

export const formatDateOnly = (value: Date): string => {
  return value.toISOString().slice(0, 10);
};

export const formatDateTime = (value: Date): string => {
  return value.toISOString();
};

export const daysAgo = (days: number): Date => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};
