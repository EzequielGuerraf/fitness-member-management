import {
  BillingPeriod,
  MembershipStatus,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

const planDefinitions = [
  {
    name: "Standard Monthly",
    description: "Recurring monthly membership with full gym floor access.",
    priceCents: 4999,
    billingPeriod: BillingPeriod.MONTHLY
  },
  {
    name: "Performance Quarterly",
    description: "Quarterly plan for members who want a longer commitment and better pricing.",
    priceCents: 12999,
    billingPeriod: BillingPeriod.QUARTERLY
  },
  {
    name: "Annual Unlimited",
    description: "Yearly membership with the best long-term value.",
    priceCents: 44999,
    billingPeriod: BillingPeriod.YEARLY
  }
] as const;

const memberDefinitions = [
  {
    firstName: "Ava",
    lastName: "Thompson",
    email: "ava.thompson@example.com",
    age: 29,
    phoneNumber: "+1 555 100 1001",
    address: "12 Oak Street"
  },
  {
    firstName: "Liam",
    lastName: "Carter",
    email: "liam.carter@example.com",
    age: 34,
    phoneNumber: "+1 555 100 1002",
    address: "45 Cedar Avenue"
  },
  {
    firstName: "Sofia",
    lastName: "Ramirez",
    email: "sofia.ramirez@example.com",
    age: 27,
    phoneNumber: "+1 555 100 1003",
    address: "88 Pine Road"
  },
  {
    firstName: "Noah",
    lastName: "Bennett",
    email: "noah.bennett@example.com",
    age: 31,
    phoneNumber: "+1 555 100 1004",
    address: "14 River Lane"
  },
  {
    firstName: "Mia",
    lastName: "Collins",
    email: "mia.collins@example.com",
    age: 25,
    phoneNumber: "+1 555 100 1005",
    address: "206 Maple Drive"
  },
  {
    firstName: "Ethan",
    lastName: "Brooks",
    email: "ethan.brooks@example.com",
    age: 38,
    phoneNumber: "+1 555 100 1006",
    address: "9 Lake View"
  },
  {
    firstName: "Chloe",
    lastName: "Nguyen",
    email: "chloe.nguyen@example.com",
    age: 30,
    phoneNumber: "+1 555 100 1007",
    address: "77 Birch Court"
  },
  {
    firstName: "Lucas",
    lastName: "Reed",
    email: "lucas.reed@example.com",
    age: 41,
    phoneNumber: "+1 555 100 1008",
    address: "31 Hill Street"
  },
  {
    firstName: "Isabella",
    lastName: "Flores",
    email: "isabella.flores@example.com",
    age: 33,
    phoneNumber: "+1 555 100 1009",
    address: "152 Garden Avenue"
  },
  {
    firstName: "Mason",
    lastName: "Price",
    email: "mason.price@example.com",
    age: 24,
    phoneNumber: "+1 555 100 1010",
    address: "63 Market Street"
  }
] as const;

const dateOnlyDaysAgo = (daysAgo: number): Date => {
  const value = new Date();
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() - daysAgo);
  return value;
};

const dateTimeDaysAgo = (
  daysAgo: number,
  hour: number,
  minute: number
): Date => {
  const value = new Date();
  value.setUTCSeconds(0, 0);
  value.setUTCHours(hour, minute, 0, 0);
  value.setUTCDate(value.getUTCDate() - daysAgo);
  return value;
};

async function main() {
  const plans = await Promise.all(
    planDefinitions.map((plan) =>
      prisma.membershipPlan.upsert({
        where: { name: plan.name },
        update: {
          description: plan.description,
          priceCents: plan.priceCents,
          billingPeriod: plan.billingPeriod,
          isActive: true
        },
        create: {
          name: plan.name,
          description: plan.description,
          priceCents: plan.priceCents,
          billingPeriod: plan.billingPeriod,
          isActive: true
        }
      })
    )
  );

  const members = await Promise.all(
    memberDefinitions.map((member) =>
      prisma.member.upsert({
        where: { email: member.email },
        update: {
          firstName: member.firstName,
          lastName: member.lastName,
          age: member.age,
          phoneNumber: member.phoneNumber,
          address: member.address
        },
        create: member
      })
    )
  );

  const memberIdByEmail = Object.fromEntries(
    members.map((member) => [member.email, member.id])
  ) as Record<string, string>;
  const planIdByName = Object.fromEntries(
    plans.map((plan) => [plan.name, plan.id])
  ) as Record<string, string>;
  const seededMemberIds = members.map((member) => member.id);

  const memberships = [
    {
      memberId: memberIdByEmail["ava.thompson@example.com"],
      planId: planIdByName["Standard Monthly"],
      startDate: dateOnlyDaysAgo(32),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["liam.carter@example.com"],
      planId: planIdByName["Performance Quarterly"],
      startDate: dateOnlyDaysAgo(74),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["sofia.ramirez@example.com"],
      planId: planIdByName["Annual Unlimited"],
      startDate: dateOnlyDaysAgo(150),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["noah.bennett@example.com"],
      planId: planIdByName["Standard Monthly"],
      startDate: dateOnlyDaysAgo(18),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["mia.collins@example.com"],
      planId: planIdByName["Standard Monthly"],
      startDate: dateOnlyDaysAgo(41),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["ethan.brooks@example.com"],
      planId: planIdByName["Performance Quarterly"],
      startDate: dateOnlyDaysAgo(23),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["chloe.nguyen@example.com"],
      planId: planIdByName["Annual Unlimited"],
      startDate: dateOnlyDaysAgo(220),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["lucas.reed@example.com"],
      planId: planIdByName["Standard Monthly"],
      startDate: dateOnlyDaysAgo(9),
      status: MembershipStatus.ACTIVE,
      cancellationEffectiveDate: null
    },
    {
      memberId: memberIdByEmail["isabella.flores@example.com"],
      planId: planIdByName["Performance Quarterly"],
      startDate: dateOnlyDaysAgo(90),
      status: MembershipStatus.CANCELED,
      cancellationEffectiveDate: dateOnlyDaysAgo(12)
    }
  ];

  const checkIns = [
    {
      memberId: memberIdByEmail["ava.thompson@example.com"],
      checkedInAt: dateTimeDaysAgo(28, 7, 45)
    },
    {
      memberId: memberIdByEmail["ava.thompson@example.com"],
      checkedInAt: dateTimeDaysAgo(17, 18, 10)
    },
    {
      memberId: memberIdByEmail["ava.thompson@example.com"],
      checkedInAt: dateTimeDaysAgo(4, 8, 5)
    },
    {
      memberId: memberIdByEmail["liam.carter@example.com"],
      checkedInAt: dateTimeDaysAgo(26, 6, 55)
    },
    {
      memberId: memberIdByEmail["liam.carter@example.com"],
      checkedInAt: dateTimeDaysAgo(15, 17, 40)
    },
    {
      memberId: memberIdByEmail["liam.carter@example.com"],
      checkedInAt: dateTimeDaysAgo(2, 7, 20)
    },
    {
      memberId: memberIdByEmail["sofia.ramirez@example.com"],
      checkedInAt: dateTimeDaysAgo(20, 12, 15)
    },
    {
      memberId: memberIdByEmail["sofia.ramirez@example.com"],
      checkedInAt: dateTimeDaysAgo(11, 12, 5)
    },
    {
      memberId: memberIdByEmail["noah.bennett@example.com"],
      checkedInAt: dateTimeDaysAgo(14, 19, 25)
    },
    {
      memberId: memberIdByEmail["noah.bennett@example.com"],
      checkedInAt: dateTimeDaysAgo(6, 19, 10)
    },
    {
      memberId: memberIdByEmail["mia.collins@example.com"],
      checkedInAt: dateTimeDaysAgo(25, 8, 0)
    },
    {
      memberId: memberIdByEmail["mia.collins@example.com"],
      checkedInAt: dateTimeDaysAgo(8, 8, 35)
    },
    {
      memberId: memberIdByEmail["ethan.brooks@example.com"],
      checkedInAt: dateTimeDaysAgo(19, 6, 30)
    },
    {
      memberId: memberIdByEmail["ethan.brooks@example.com"],
      checkedInAt: dateTimeDaysAgo(10, 18, 50)
    },
    {
      memberId: memberIdByEmail["ethan.brooks@example.com"],
      checkedInAt: dateTimeDaysAgo(1, 18, 45)
    },
    {
      memberId: memberIdByEmail["chloe.nguyen@example.com"],
      checkedInAt: dateTimeDaysAgo(22, 7, 10)
    },
    {
      memberId: memberIdByEmail["chloe.nguyen@example.com"],
      checkedInAt: dateTimeDaysAgo(13, 7, 35)
    },
    {
      memberId: memberIdByEmail["lucas.reed@example.com"],
      checkedInAt: dateTimeDaysAgo(7, 20, 0)
    },
    {
      memberId: memberIdByEmail["lucas.reed@example.com"],
      checkedInAt: dateTimeDaysAgo(3, 20, 20)
    },
    {
      memberId: memberIdByEmail["isabella.flores@example.com"],
      checkedInAt: dateTimeDaysAgo(16, 9, 15)
    }
  ];

  await prisma.$transaction([
    prisma.checkIn.deleteMany({
      where: {
        memberId: {
          in: seededMemberIds
        }
      }
    }),
    prisma.membership.deleteMany({
      where: {
        memberId: {
          in: seededMemberIds
        }
      }
    }),
    prisma.membership.createMany({
      data: memberships
    }),
    prisma.checkIn.createMany({
      data: checkIns.map((checkIn) => ({
        ...checkIn,
        createdAt: checkIn.checkedInAt
      }))
    })
  ]);

  console.log(
    `Seed completed: ${members.length} members, ${plans.length} plans, ${memberships.length} memberships, ${checkIns.length} check-ins.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
