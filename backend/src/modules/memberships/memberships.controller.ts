import type { RequestHandler } from "express";
import { asyncHandler } from "../../lib/async-handler";
import type {
  AssignMembershipBody,
  CancelMembershipBody,
  CancelMembershipParams,
  MemberMembershipParams
} from "./memberships.schemas";
import { MembershipsService } from "./memberships.service";

const membershipsService = new MembershipsService();

export const assignMembershipToMember: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as MemberMembershipParams;
  const membership = await membershipsService.assignMembershipToMember(
    id,
    request.body as AssignMembershipBody
  );

  response.status(201).json({ data: membership });
});

export const cancelMembershipForMember: RequestHandler = asyncHandler(async (request, response) => {
  const { id, membershipId } = request.params as CancelMembershipParams;
  const membership = await membershipsService.cancelMembershipForMember(
    id,
    membershipId,
    request.body as CancelMembershipBody
  );

  response.status(200).json({ data: membership });
});
