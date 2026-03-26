import {
  BillingPeriod,
  MembershipStatus,
  Prisma,
  type PrismaClient
} from "@prisma/client";
import { formatDateOnly, formatDateTime, parseDateOnly } from "../../lib/date";
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError
} from "../../lib/errors/app-error";
import { prisma } from "../../lib/prisma";
import type {
  AssignMembershipBody,
  CancelMembershipBody
} from "./memberships.schemas";
import type { MembershipDto } from "./memberships.types";

type MembershipsDatabase = Pick<PrismaClient, "$transaction">;

type MembershipRecord = {
  id: string;
  memberId: string;
  planId: string;
  startDate: Date;
  status: MembershipStatus;
  cancellationEffectiveDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  plan: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    billingPeriod: BillingPeriod;
    isActive: boolean;
  };
};

const ACTIVE_MEMBERSHIP_INDEX_NAME = "memberships_one_active_per_member_idx";

export class MembershipsService {
  constructor(private readonly database: MembershipsDatabase = prisma) {}

  async assignMembershipToMember(
    memberId: string,
    input: AssignMembershipBody
  ): Promise<MembershipDto> {
    const startDate = parseDateOnly(input.startDate);
    const today = formatDateOnly(new Date());

    if (input.startDate > today) {
      throw new UnprocessableEntityError(
        "Membership start date cannot be in the future.",
        "INVALID_START_DATE"
      );
    }

    try {
      return await this.database.$transaction(
        async (transaction) => {
          // The rule is protected in two layers:
          // 1. The read-check-create flow runs inside a SERIALIZABLE transaction.
          // 2. A partial unique index on ACTIVE memberships prevents concurrent inserts
          //    from persisting two active memberships for the same member.
          const member = await transaction.member.findUnique({
            where: { id: memberId },
            select: { id: true }
          });

          if (!member) {
            throw new NotFoundError("Member not found.", "MEMBER_NOT_FOUND");
          }

          const plan = await transaction.membershipPlan.findFirst({
            where: {
              id: input.planId,
              isActive: true
            },
            select: {
              id: true
            }
          });

          if (!plan) {
            throw new NotFoundError("Active membership plan not found.", "PLAN_NOT_FOUND");
          }

          const existingActiveMembership = await transaction.membership.findFirst({
            where: {
              memberId,
              status: MembershipStatus.ACTIVE
            },
            select: {
              id: true
            }
          });

          if (existingActiveMembership) {
            throw new ConflictError(
              "Member already has an active membership.",
              "ACTIVE_MEMBERSHIP_ALREADY_EXISTS",
              { memberId }
            );
          }

          const membership = await transaction.membership.create({
            data: {
              memberId,
              planId: input.planId,
              startDate,
              status: MembershipStatus.ACTIVE
            },
            select: {
              id: true,
              memberId: true,
              planId: true,
              startDate: true,
              status: true,
              cancellationEffectiveDate: true,
              createdAt: true,
              updatedAt: true,
              plan: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  priceCents: true,
                  billingPeriod: true,
                  isActive: true
                }
              }
            }
          });

          return toMembershipDto(membership);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      );
    } catch (error) {
      if (isActiveMembershipUniqueConflict(error)) {
        throw new ConflictError(
          "Member already has an active membership.",
          "ACTIVE_MEMBERSHIP_ALREADY_EXISTS",
          { memberId }
        );
      }

      throw error;
    }
  }

  async cancelMembershipForMember(
    memberId: string,
    membershipId: string,
    input: CancelMembershipBody
  ): Promise<MembershipDto> {
    const effectiveDate = parseDateOnly(input.effectiveDate);
    const today = formatDateOnly(new Date());

    if (input.effectiveDate > today) {
      throw new UnprocessableEntityError(
        "Cancellation effective date cannot be in the future.",
        "INVALID_CANCELLATION_EFFECTIVE_DATE"
      );
    }

    return this.database.$transaction(async (transaction) => {
      const membership = await transaction.membership.findFirst({
        where: {
          id: membershipId,
          memberId
        },
        select: {
          id: true,
          startDate: true,
          status: true
        }
      });

      if (!membership) {
        throw new NotFoundError("Membership not found for member.", "MEMBERSHIP_NOT_FOUND");
      }

      if (membership.status === MembershipStatus.CANCELED) {
        throw new ConflictError("Membership is already canceled.", "MEMBERSHIP_ALREADY_CANCELED");
      }

      if (input.effectiveDate < formatDateOnly(membership.startDate)) {
        throw new UnprocessableEntityError(
          "Cancellation effective date cannot be earlier than the membership start date.",
          "INVALID_CANCELLATION_EFFECTIVE_DATE"
        );
      }

      const updatedMembership = await transaction.membership.update({
        where: {
          id: membershipId
        },
        data: {
          status: MembershipStatus.CANCELED,
          cancellationEffectiveDate: effectiveDate
        },
        select: {
          id: true,
          memberId: true,
          planId: true,
          startDate: true,
          status: true,
          cancellationEffectiveDate: true,
          createdAt: true,
          updatedAt: true,
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
              priceCents: true,
              billingPeriod: true,
              isActive: true
            }
          }
        }
      });

      return toMembershipDto(updatedMembership);
    });
  }
}

const isActiveMembershipUniqueConflict = (error: unknown): boolean => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  if (!target) {
    return true;
  }

  if (typeof target === "string") {
    return target.includes(ACTIVE_MEMBERSHIP_INDEX_NAME);
  }

  if (Array.isArray(target)) {
    return target.some((value) => String(value).includes(ACTIVE_MEMBERSHIP_INDEX_NAME));
  }

  return false;
};

const toMembershipDto = (membership: MembershipRecord): MembershipDto => {
  return {
    id: membership.id,
    memberId: membership.memberId,
    planId: membership.planId,
    startDate: formatDateOnly(membership.startDate),
    status: membership.status,
    cancellationEffectiveDate: membership.cancellationEffectiveDate
      ? formatDateOnly(membership.cancellationEffectiveDate)
      : null,
    createdAt: formatDateTime(membership.createdAt),
    updatedAt: formatDateTime(membership.updatedAt),
    plan: {
      id: membership.plan.id,
      name: membership.plan.name,
      description: membership.plan.description,
      priceCents: membership.plan.priceCents,
      billingPeriod: membership.plan.billingPeriod,
      isActive: membership.plan.isActive
    }
  };
};
