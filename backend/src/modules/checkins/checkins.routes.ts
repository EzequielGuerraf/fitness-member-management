import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { recordMemberCheckIn } from "./checkins.controller";
import { memberCheckInParamsSchema } from "./checkins.schemas";

const router = Router();

router.post(
  "/:id/check-ins",
  validateRequest({
    params: memberCheckInParamsSchema
  }),
  recordMemberCheckIn
);

export const checkInsRoutes = router;
