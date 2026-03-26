import { apiRequest } from "./client";
import type {
  AssignMembershipInput,
  CancelMembershipInput,
  CreateMemberInput,
  MemberCheckIn,
  MemberListItem,
  MembershipRecord,
  MemberSummary
} from "../types/members";

export const fetchMembers = async (
  query: string,
  signal?: AbortSignal
): Promise<MemberListItem[]> => {
  const searchParams = new URLSearchParams();

  if (query.trim()) {
    searchParams.set("q", query.trim());
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return apiRequest<MemberListItem[]>(`/members${suffix}`, { signal });
};

export const fetchMemberSummary = async (
  memberId: string,
  signal?: AbortSignal
): Promise<MemberSummary> => {
  return apiRequest<MemberSummary>(`/members/${memberId}`, { signal });
};

export const createMember = async (
  payload: CreateMemberInput
): Promise<MemberListItem> => {
  return apiRequest<MemberListItem>("/members", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const assignMembershipToMember = async (
  memberId: string,
  payload: AssignMembershipInput
): Promise<MembershipRecord> => {
  return apiRequest<MembershipRecord>(`/members/${memberId}/memberships`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const cancelMembershipForMember = async (
  memberId: string,
  membershipId: string,
  payload: CancelMembershipInput
): Promise<MembershipRecord> => {
  return apiRequest<MembershipRecord>(
    `/members/${memberId}/memberships/${membershipId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
};

export const recordMemberCheckIn = async (
  memberId: string
): Promise<MemberCheckIn> => {
  return apiRequest<MemberCheckIn>(`/members/${memberId}/check-ins`, {
    method: "POST"
  });
};
