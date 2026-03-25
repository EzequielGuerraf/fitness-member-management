import type { BillingPeriod } from "@prisma/client";

export interface PlanDto {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  billingPeriod: BillingPeriod;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
