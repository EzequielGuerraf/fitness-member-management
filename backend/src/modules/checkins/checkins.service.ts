import { MembershipStatus, type PrismaClient } from "@prisma/client";
import { formatDateTime } from "../../lib/date";
import { ConflictError, NotFoundError } from "../../lib/errors/app-error";
import { prisma } from "../../lib/prisma";
import type { CheckInDto, CheckInListItemDto } from "./checkins.types";

type CheckInsDatabase = Pick<PrismaClient, "$transaction" | "checkIn">;

export class CheckInsService {
  constructor(private readonly database: CheckInsDatabase = prisma) {}

  async listCheckIns(): Promise<CheckInListItemDto[]> {
    const checkIns = await this.database.checkIn.findMany({
      orderBy: [{ checkedInAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        memberId: true,
        checkedInAt: true,
        createdAt: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return checkIns.map((checkIn) => ({
      id: checkIn.id,
      memberId: checkIn.memberId,
      checkedInAt: formatDateTime(checkIn.checkedInAt),
      createdAt: formatDateTime(checkIn.createdAt),
      member: {
        id: checkIn.member.id,
        firstName: checkIn.member.firstName,
        lastName: checkIn.member.lastName,
        email: checkIn.member.email
      }
    }));
  }

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
