import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');
  await prisma.$executeRaw`TRUNCATE TABLE "users", "tiers" RESTART IDENTITY CASCADE;`;
  await prisma.tiers.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'free', price: 0 },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
