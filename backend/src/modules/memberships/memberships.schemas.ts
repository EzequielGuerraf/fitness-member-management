import { z } from "zod";
import { buildDateOnlySchema, buildUuidSchema } from "../../lib/validation-schemas";

export const assignMembershipBodySchema = z.object({
  planId: buildUuidSchema("planId"),
  startDate: buildDateOnlySchema("startDate")
});

export const cancelMembershipBodySchema = z.object({
  effectiveDate: buildDateOnlySchema("effectiveDate")
});

export const memberMembershipParamsSchema = z.object({
  id: buildUuidSchema("Member id")
});

export const cancelMembershipParamsSchema = z.object({
  id: buildUuidSchema("Member id"),
  membershipId: buildUuidSchema("membershipId")
});

export type AssignMembershipBody = z.infer<typeof assignMembershipBodySchema>;
export type CancelMembershipBody = z.infer<typeof cancelMembershipBodySchema>;
export type MemberMembershipParams = z.infer<typeof memberMembershipParamsSchema>;
export type CancelMembershipParams = z.infer<typeof cancelMembershipParamsSchema>;
