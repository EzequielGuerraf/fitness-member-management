import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { createPlan, listPlans } from "./plans.controller";
import { createPlanBodySchema } from "./plans.schemas";

const router = Router();

router.post("/", validateRequest({ body: createPlanBodySchema }), createPlan);
router.get("/", listPlans);

export const plansRoutes = router;
