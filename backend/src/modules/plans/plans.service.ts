import type { PrismaClient } from "@prisma/client";
import { formatDateTime } from "../../lib/date";
import { prisma } from "../../lib/prisma";
import type { PlanDto } from "./plans.types";

type PlansDatabase = Pick<PrismaClient, "membershipPlan">;

export class PlansService {
  constructor(private readonly database: PlansDatabase = prisma) {}

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

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceCents,
      billingPeriod: plan.billingPeriod,
      isActive: plan.isActive,
      createdAt: formatDateTime(plan.createdAt),
      updatedAt: formatDateTime(plan.updatedAt)
    }));
  }
}
