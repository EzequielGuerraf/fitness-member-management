import { MembershipStatus, type PrismaClient } from "@prisma/client";
import { formatDateTime } from "../../lib/date";
import { ConflictError, NotFoundError } from "../../lib/errors/app-error";
import { prisma } from "../../lib/prisma";
import type { CheckInDto } from "./checkins.types";

type CheckInsDatabase = Pick<PrismaClient, "$transaction">;

export class CheckInsService {
  constructor(private readonly database: CheckInsDatabase = prisma) {}

  async recordMemberCheckIn(memberId: string): Promise<CheckInDto> {
    return this.database.$transaction(async (transaction) => {
      const member = await transaction.member.findUnique({
        where: { id: memberId },
        select: { id: true }
      });

      if (!member) {
        throw new NotFoundError("Member not found.", "MEMBER_NOT_FOUND");
      }

      const activeMembership = await transaction.membership.findFirst({
        where: {
          memberId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          id: true
        }
      });

      if (!activeMembership) {
        throw new ConflictError(
          "Only members with an active membership can check in.",
          "ACTIVE_MEMBERSHIP_REQUIRED"
        );
      }

      const checkIn = await transaction.checkIn.create({
        data: {
          memberId
        },
        select: {
          id: true,
          memberId: true,
          checkedInAt: true,
          createdAt: true
        }
      });

      return {
        id: checkIn.id,
        memberId: checkIn.memberId,
        checkedInAt: formatDateTime(checkIn.checkedInAt),
        createdAt: formatDateTime(checkIn.createdAt)
      };
    });
  }
}
