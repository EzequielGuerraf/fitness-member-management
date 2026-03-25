import { z } from "zod";

const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const buildUuidSchema = (fieldName: string) => {
  return z.string().uuid(`${fieldName} must be a valid UUID.`);
};

export const buildDateOnlySchema = (fieldName: string) => {
  return z
    .string()
    .regex(ISO_DATE_ONLY_PATTERN, `${fieldName} must be in YYYY-MM-DD format.`);
};
