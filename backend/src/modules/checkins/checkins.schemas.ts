import { z } from "zod";
import { buildUuidSchema } from "../../lib/validation-schemas";

export const memberCheckInParamsSchema = z.object({
  id: buildUuidSchema("Member id")
});

export type MemberCheckInParams = z.infer<typeof memberCheckInParamsSchema>;
