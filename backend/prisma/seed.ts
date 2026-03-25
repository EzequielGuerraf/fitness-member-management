import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed placeholder: add initial data here when models are ready.");

  // Example:
  // await prisma.member.create({
  //   data: {
  //     name: "Demo Member"
  //   }
  // });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
