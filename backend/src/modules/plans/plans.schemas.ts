import { BillingPeriod } from "@prisma/client";
import { z } from "zod";

export const createPlanBodySchema = z.object({
  name: z.string().trim().min(1, "name is required.").max(100, "name must be at most 100 characters."),
  description: z
    .string()
    .trim()
    .max(500, "description must be at most 500 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  priceCents: z
    .number()
    .int("priceCents must be an integer.")
    .min(0, "priceCents must be at least 0."),
  billingPeriod: z.nativeEnum(BillingPeriod)
});

export type CreatePlanBody = z.infer<typeof createPlanBodySchema>;
