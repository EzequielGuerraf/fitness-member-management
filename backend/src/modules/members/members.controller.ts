import type { RequestHandler } from "express";
import { asyncHandler } from "../../lib/async-handler";
import type { CreateMemberBody, ListMembersQuery, MemberIdParams } from "./members.schemas";
import { MembersService } from "./members.service";

const membersService = new MembersService();

export const createMember: RequestHandler = asyncHandler(async (request, response) => {
  const member = await membersService.createMember(request.body as CreateMemberBody);

  response.status(201).json({ data: member });
});

export const listMembers: RequestHandler = asyncHandler(async (request, response) => {
  const members = await membersService.listMembers(request.query as ListMembersQuery);

  response.status(200).json({ data: members });
});

export const getMemberSummary: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as MemberIdParams;
  const member = await membersService.getMemberSummary(id);

  response.status(200).json({ data: member });
});
