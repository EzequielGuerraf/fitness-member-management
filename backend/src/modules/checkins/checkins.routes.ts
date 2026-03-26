import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { listCheckIns, recordMemberCheckIn } from "./checkins.controller";
import { memberCheckInParamsSchema } from "./checkins.schemas";

const router = Router();

router.get("/check-ins", listCheckIns);

router.post(
  "/members/:id/check-ins",
  validateRequest({
    params: memberCheckInParamsSchema
  }),
  recordMemberCheckIn
);

export const checkInsRoutes = router;
