import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import {
  assignMembershipToMember,
  cancelMembershipForMember
} from "./memberships.controller";
import {
  assignMembershipBodySchema,
  cancelMembershipBodySchema,
  cancelMembershipParamsSchema,
  memberMembershipParamsSchema
} from "./memberships.schemas";

const router = Router();

router.post(
  "/:id/memberships",
  validateRequest({
    params: memberMembershipParamsSchema,
    body: assignMembershipBodySchema
  }),
  assignMembershipToMember
);

router.post(
  "/:id/memberships/:membershipId/cancel",
  validateRequest({
    params: cancelMembershipParamsSchema,
    body: cancelMembershipBodySchema
  }),
  cancelMembershipForMember
);

export const membershipsRoutes = router;
