import { Prisma, type PrismaClient } from "@prisma/client";
import { formatDateTime } from "../../lib/date";
import { ConflictError } from "../../lib/errors/app-error";
import { prisma } from "../../lib/prisma";
import type { CreatePlanBody } from "./plans.schemas";
import type { PlanDto } from "./plans.types";

type PlansDatabase = Pick<PrismaClient, "membershipPlan">;

export class PlansService {
  constructor(private readonly database: PlansDatabase = prisma) {}

  async createPlan(input: CreatePlanBody): Promise<PlanDto> {
    try {
      const plan = await this.database.membershipPlan.create({
        data: input,
        select: {
          id: true,
          name: true,
          description: true,
          priceCents: true,
          billingPeriod: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return toPlanDto(plan);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("A membership plan with this name already exists.", "PLAN_NAME_ALREADY_EXISTS", {
          name: input.name
        });
      }

      throw error;
    }
  }

  async listPlans(): Promise<PlanDto[]> {
    const plans = await this.database.membershipPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: [{ priceCents: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        billingPeriod: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return plans.map(toPlanDto);
  }
}

const toPlanDto = (plan: {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  billingPeriod: PlanDto["billingPeriod"];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PlanDto => {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceCents: plan.priceCents,
    billingPeriod: plan.billingPeriod,
    isActive: plan.isActive,
    createdAt: formatDateTime(plan.createdAt),
    updatedAt: formatDateTime(plan.updatedAt)
  };
};
