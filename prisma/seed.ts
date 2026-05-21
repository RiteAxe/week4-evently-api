import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@evently.com",
    },
    update: {},
    create: {
      name: "Admin",
      email: "admin@evently.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });