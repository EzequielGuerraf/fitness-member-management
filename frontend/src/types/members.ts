import type { MembershipPlan } from "./plans";

export interface MemberListItem {
  address: string | null;
  age: number | null;
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phoneNumber: string | null;
  updatedAt: string;
}

export interface ActiveMembershipSummary {
  cancellationEffectiveDate: string | null;
  id: string;
  plan: MembershipPlan;
  startDate: string;
  status: "ACTIVE" | "CANCELED";
}

export interface MemberSummary extends MemberListItem {
  activeMembership: ActiveMembershipSummary | null;
  checkInCountLast30Days: number;
  lastCheckInAt: string | null;
}

export interface CreateMemberInput {
  address?: string;
  age?: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
