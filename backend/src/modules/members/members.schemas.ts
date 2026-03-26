import { z } from "zod";
import { buildUuidSchema } from "../../lib/validation-schemas";

export const createMemberBodySchema = z.object({
  firstName: z.string().trim().min(1, "firstName is required.").max(100, "firstName must be at most 100 characters."),
  lastName: z.string().trim().min(1, "lastName is required.").max(100, "lastName must be at most 100 characters."),
  email: z
    .string()
    .trim()
    .email("email must be a valid email address.")
    .max(255, "email must be at most 255 characters.")
    .transform((value) => value.toLowerCase()),
  age: z
    .number()
    .int("age must be an integer.")
    .min(0, "age must be at least 0.")
    .max(120, "age must be at most 120.")
    .optional(),
  phoneNumber: z
    .string()
    .trim()
    .max(30, "phoneNumber must be at most 30 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  address: z
    .string()
    .trim()
    .max(255, "address must be at most 255 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
});

export const listMembersQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(100, "q must be at most 100 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
});

export const memberIdParamsSchema = z.object({
  id: buildUuidSchema("Member id")
});

export type CreateMemberBody = z.infer<typeof createMemberBodySchema>;
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type MemberIdParams = z.infer<typeof memberIdParamsSchema>;
