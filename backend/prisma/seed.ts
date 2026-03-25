import { BillingPeriod, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.membershipPlan.upsert({
    where: { name: "Standard Monthly" },
    update: {
      description: "Recurring monthly membership plan.",
      priceCents: 4999,
      billingPeriod: BillingPeriod.MONTHLY,
      isActive: true
    },
    create: {
      name: "Standard Monthly",
      description: "Recurring monthly membership plan.",
      priceCents: 4999,
      billingPeriod: BillingPeriod.MONTHLY,
      isActive: true
    }
  });

  console.log("Seed completed: ensured at least one active membership plan.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
