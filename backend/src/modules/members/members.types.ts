import type { BillingPeriod, MembershipStatus } from "@prisma/client";

export interface MemberListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberActiveMembershipDto {
  id: string;
  status: MembershipStatus;
  startDate: string;
  cancellationEffectiveDate: string | null;
  plan: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    billingPeriod: BillingPeriod;
    isActive: boolean;
  };
}

export interface MemberSummaryDto extends MemberListItemDto {
  activeMembership: MemberActiveMembershipDto | null;
  lastCheckInAt: string | null;
  checkInCountLast30Days: number;
}
