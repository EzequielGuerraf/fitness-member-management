import type { BillingPeriod, MembershipStatus } from "@prisma/client";

export interface MembershipDto {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  status: MembershipStatus;
  cancellationEffectiveDate: string | null;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    billingPeriod: BillingPeriod;
    isActive: boolean;
  };
}
