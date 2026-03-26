export type BillingPeriod = "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface MembershipPlan {
  billingPeriod: BillingPeriod;
  createdAt: string;
  description: string | null;
  id: string;
  isActive: boolean;
  name: string;
  priceCents: number;
  updatedAt: string;
}

export interface CreatePlanInput {
  billingPeriod: BillingPeriod;
  description?: string;
  name: string;
  priceCents: number;
}
