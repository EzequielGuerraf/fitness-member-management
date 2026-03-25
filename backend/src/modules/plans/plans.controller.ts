import type { RequestHandler } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { PlansService } from "./plans.service";

const plansService = new PlansService();

export const listPlans: RequestHandler = asyncHandler(async (_request, response) => {
  const plans = await plansService.listPlans();

  response.status(200).json({ data: plans });
});
