import type { RequestHandler } from "express";
import { asyncHandler } from "../../lib/async-handler";
import type { MemberCheckInParams } from "./checkins.schemas";
import { CheckInsService } from "./checkins.service";

const checkInsService = new CheckInsService();

export const recordMemberCheckIn: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as MemberCheckInParams;
  const checkIn = await checkInsService.recordMemberCheckIn(id);

  response.status(201).json({ data: checkIn });
});
