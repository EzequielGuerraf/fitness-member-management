import { apiRequest } from "./client";
import type { CreatePlanInput, MembershipPlan } from "../types/plans";

export const fetchPlans = async (
  signal?: AbortSignal
): Promise<MembershipPlan[]> => {
  return apiRequest<MembershipPlan[]>("/plans", { signal });
};

export const createPlan = async (
  payload: CreatePlanInput
): Promise<MembershipPlan> => {
  return apiRequest<MembershipPlan>("/plans", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};
