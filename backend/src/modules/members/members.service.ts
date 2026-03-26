import { MembershipStatus, Prisma, type PrismaClient } from "@prisma/client";
import { daysAgo, formatDateOnly, formatDateTime } from "../../lib/date";
import { ConflictError, NotFoundError } from "../../lib/errors/app-error";
import { prisma } from "../../lib/prisma";
import type { CreateMemberBody, ListMembersQuery } from "./members.schemas";
import type { MemberListItemDto, MemberSummaryDto } from "./members.types";

type MembersDatabase = Pick<PrismaClient, "$transaction" | "checkIn" | "member">;

export class MembersService {
  constructor(private readonly database: MembersDatabase = prisma) {}

  async createMember(input: CreateMemberBody): Promise<MemberListItemDto> {
    try {
      const member = await this.database.member.create({
        data: input,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          age: true,
          phoneNumber: true,
          address: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return toMemberListItem(member);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("A member with this email already exists.", "MEMBER_EMAIL_ALREADY_EXISTS", {
          email: input.email
        });
      }

      throw error;
    }
  }

  async listMembers(query: ListMembersQuery): Promise<MemberListItemDto[]> {
    const members = await this.database.member.findMany({
      where: query.q
        ? {
            OR: [
              {
                firstName: {
                  contains: query.q,
                  mode: "insensitive"
                }
              },
              {
                lastName: {
                  contains: query.q,
                  mode: "insensitive"
                }
              },
              {
                email: {
                  contains: query.q,
                  mode: "insensitive"
                }
              }
            ]
          }
        : undefined,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 50,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        age: true,
        phoneNumber: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return members.map(toMemberListItem);
  }

  async getMemberSummary(memberId: string): Promise<MemberSummaryDto> {
    const [member, checkInCountLast30Days] = await this.database.$transaction([
      this.database.member.findUnique({
        where: { id: memberId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          age: true,
          phoneNumber: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          memberships: {
            where: {
              status: MembershipStatus.ACTIVE
            },
            orderBy: {
              createdAt: "desc"
            },
            take: 1,
            select: {
              id: true,
              status: true,
              startDate: true,
              cancellationEffectiveDate: true,
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
          },
          checkIns: {
            orderBy: {
              checkedInAt: "desc"
            },
            take: 1,
            select: {
              checkedInAt: true
            }
          }
        }
      }),
      this.database.checkIn.count({
        where: {
          memberId,
          checkedInAt: {
            gte: daysAgo(30)
          }
        }
      })
    ]);

    if (!member) {
      throw new NotFoundError("Member not found.", "MEMBER_NOT_FOUND");
    }

    const activeMembership = member.memberships[0];

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      age: member.age,
      phoneNumber: member.phoneNumber,
      address: member.address,
      createdAt: formatDateTime(member.createdAt),
      updatedAt: formatDateTime(member.updatedAt),
      activeMembership: activeMembership
        ? {
            id: activeMembership.id,
            status: activeMembership.status,
            startDate: formatDateOnly(activeMembership.startDate),
            cancellationEffectiveDate: activeMembership.cancellationEffectiveDate
              ? formatDateOnly(activeMembership.cancellationEffectiveDate)
              : null,
            plan: {
              id: activeMembership.plan.id,
              name: activeMembership.plan.name,
              description: activeMembership.plan.description,
              priceCents: activeMembership.plan.priceCents,
              billingPeriod: activeMembership.plan.billingPeriod,
              isActive: activeMembership.plan.isActive
            }
          }
        : null,
      lastCheckInAt: member.checkIns[0] ? formatDateTime(member.checkIns[0].checkedInAt) : null,
      checkInCountLast30Days
    };
  }
}

const toMemberListItem = (member: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  phoneNumber: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MemberListItemDto => {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    age: member.age,
    phoneNumber: member.phoneNumber,
    address: member.address,
    createdAt: formatDateTime(member.createdAt),
    updatedAt: formatDateTime(member.updatedAt)
  };
};
