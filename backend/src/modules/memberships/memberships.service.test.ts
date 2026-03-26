import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import {
  ConflictError,
  UnprocessableEntityError
} from "../../lib/errors/app-error";
import { MembershipsService } from "./memberships.service";

const shouldRejectCreatingSecondActiveMembership = async () => {
  let createWasCalled = false;

  const transactionClient = {
    member: {
      findUnique: async () => ({ id: "member-1" })
    },
    membershipPlan: {
      findFirst: async () => ({ id: "plan-1" })
    },
    membership: {
      findFirst: async () => ({ id: "membership-1" }),
      create: async () => {
        createWasCalled = true;

        return {
          id: "membership-2",
          memberId: "member-1",
          planId: "plan-1",
          startDate: new Date("2026-03-25T00:00:00.000Z"),
          status: "ACTIVE",
          cancellationEffectiveDate: null,
          createdAt: new Date("2026-03-25T10:00:00.000Z"),
          updatedAt: new Date("2026-03-25T10:00:00.000Z"),
          plan: {
            id: "plan-1",
            name: "Standard Monthly",
            description: null,
            priceCents: 4999,
            billingPeriod: "MONTHLY",
            isActive: true
          }
        };
      }
    }
  };

  const database = {
    $transaction: async <T>(callback: (client: typeof transactionClient) => Promise<T>) => {
      return callback(transactionClient);
    }
  };

  const service = new MembershipsService(database as never);

  await assert.rejects(
    () =>
      service.assignMembershipToMember("member-1", {
        planId: "plan-1",
        startDate: "2026-03-25"
      }),
    (error: unknown) => {
      assert.ok(error instanceof ConflictError);
      assert.equal(error.code, "ACTIVE_MEMBERSHIP_ALREADY_EXISTS");

      return true;
    }
  );

  assert.equal(createWasCalled, false);
};

const shouldAllowCreatingMembershipWhenOnlyCanceledMembershipsExist = async () => {
  let createWasCalled = false;
  let membershipFindFirstArgs: unknown;

  const existingMemberships = [
    {
      id: "membership-canceled-1",
      memberId: "member-1",
      status: "CANCELED"
    }
  ];

  const transactionClient = {
    member: {
      findUnique: async () => ({ id: "member-1" })
    },
    membershipPlan: {
      findFirst: async () => ({ id: "plan-1" })
    },
    membership: {
      findFirst: async (args: {
        where: { memberId: string; status: string };
      }) => {
        membershipFindFirstArgs = args;

        return (
          existingMemberships.find(
            (membership) =>
              membership.memberId === args.where.memberId &&
              membership.status === args.where.status
          ) ?? null
        );
      },
      create: async () => {
        createWasCalled = true;

        return {
          id: "membership-2",
          memberId: "member-1",
          planId: "plan-1",
          startDate: new Date("2026-03-25T00:00:00.000Z"),
          status: "ACTIVE",
          cancellationEffectiveDate: null,
          createdAt: new Date("2026-03-25T10:00:00.000Z"),
          updatedAt: new Date("2026-03-25T10:00:00.000Z"),
          plan: {
            id: "plan-1",
            name: "Standard Monthly",
            description: null,
            priceCents: 4999,
            billingPeriod: "MONTHLY",
            isActive: true
          }
        };
      }
    }
  };

  const database = {
    $transaction: async <T>(callback: (client: typeof transactionClient) => Promise<T>) => {
      return callback(transactionClient);
    }
  };

  const service = new MembershipsService(database as never);
  const membership = await service.assignMembershipToMember("member-1", {
    planId: "plan-1",
    startDate: "2026-03-25"
  });

  assert.deepEqual(membershipFindFirstArgs, {
    where: {
      memberId: "member-1",
      status: "ACTIVE"
    },
    select: {
      id: true
    }
  });
  assert.equal(createWasCalled, true);
  assert.equal(membership.id, "membership-2");
  assert.equal(membership.status, "ACTIVE");
};

const shouldMapDatabaseUniquenessConflict = async () => {
  const database = {
    $transaction: async () => {
      throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed.", {
        code: "P2002",
        clientVersion: "test",
        meta: {
          target: "memberships_one_active_per_member_idx"
        }
      });
    }
  };

  const service = new MembershipsService(database as never);

  await assert.rejects(
    () =>
      service.assignMembershipToMember("member-1", {
        planId: "plan-1",
        startDate: "2026-03-25"
      }),
    (error: unknown) => {
      assert.ok(error instanceof ConflictError);
      assert.equal(error.code, "ACTIVE_MEMBERSHIP_ALREADY_EXISTS");

      return true;
    }
  );
};

const shouldRejectFutureStartDate = async () => {
  let transactionWasCalled = false;

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const database = {
    $transaction: async () => {
      transactionWasCalled = true;

      throw new Error("Transaction should not run for an invalid start date.");
    }
  };

  const service = new MembershipsService(database as never);

  await assert.rejects(
    () =>
      service.assignMembershipToMember("member-1", {
        planId: "plan-1",
        startDate: tomorrow
      }),
    (error: unknown) => {
      assert.ok(error instanceof UnprocessableEntityError);
      assert.equal(error.code, "INVALID_START_DATE");

      return true;
    }
  );

  assert.equal(transactionWasCalled, false);
};

const run = async () => {
  await shouldRejectCreatingSecondActiveMembership();
  await shouldAllowCreatingMembershipWhenOnlyCanceledMembershipsExist();
  await shouldMapDatabaseUniquenessConflict();
  await shouldRejectFutureStartDate();

  console.log("Memberships service tests passed.");
};

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});
