import { Router } from "express";
import { listPlans } from "./plans.controller";

const router = Router();

router.get("/", listPlans);

export const plansRoutes = router;
