import type { RequestHandler } from "express";
import { asyncHandler } from "../../lib/async-handler";
import type { CreatePlanBody } from "./plans.schemas";
import { PlansService } from "./plans.service";

const plansService = new PlansService();

export const createPlan: RequestHandler = asyncHandler(async (request, response) => {
  const plan = await plansService.createPlan(request.body as CreatePlanBody);

  response.status(201).json({ data: plan });
});

export const listPlans: RequestHandler = asyncHandler(async (_request, response) => {
  const plans = await plansService.listPlans();

  response.status(200).json({ data: plans });
});
