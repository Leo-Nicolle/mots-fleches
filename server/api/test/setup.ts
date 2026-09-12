import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TABLES = [
  'groupmembers',
  'styleshares',
  'crosswordshares',
  'bookshares',
  'wordlistshares',
  'fontshares',
  'customwords',
  'bannedwords',
  'words',
  'wordlists',
  'images',
  'payments',
  'tokenblacklist',
  'ydocupdates',
  'crosswords',
  'books',
  'fonts',
  'styles',
  'groups',
  'users',
];

await prisma.$executeRawUnsafe(
  `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`
);
await prisma.$disconnect();
