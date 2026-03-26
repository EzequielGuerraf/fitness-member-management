import type { MembershipPlan } from "./plans";

export type MembershipStatus = "ACTIVE" | "CANCELED";

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
  status: MembershipStatus;
}

export interface MemberSummary extends MemberListItem {
  activeMembership: ActiveMembershipSummary | null;
  checkInCountLast30Days: number;
  lastCheckInAt: string | null;
}

export interface MembershipRecord {
  cancellationEffectiveDate: string | null;
  createdAt: string;
  id: string;
  memberId: string;
  plan: MembershipPlan;
  planId: string;
  startDate: string;
  status: MembershipStatus;
  updatedAt: string;
}

export interface MemberCheckIn {
  checkedInAt: string;
  createdAt: string;
  id: string;
  memberId: string;
}

export interface CreateMemberInput {
  address?: string;
  age?: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AssignMembershipInput {
  planId: string;
  startDate: string;
}

export interface CancelMembershipInput {
  effectiveDate: string;
}
