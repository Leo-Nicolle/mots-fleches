// // test/mocks/prismaClient.ts

// const users = new Map<string, any>(); // Mock user storage

// export const prisma = {
//   tokenblacklist: {
//     create: async ({ data }: any) => {
//       return data;
//     },
//     findUnique: async ({ where: { token } }: any) => {
//   users: {
//     findUnique: async ({ where: { email, id } }: any) => {
//       if (email) {
//         return users.get(email) || null;
//       }
//       if (typeof id == 'number') {
//         return (
//           Array.from(users.values()).find((user: any) => user.id === id) || null
//         );
//       }
//       return null;
//     },
//     create: async ({ data }: any) => {
//       users.set(data.email, { ...data, id: users.size + 1 });
//       return data;
//     },
//   },
// };

// export default prisma;

// libs/__mocks__/prisma.ts
// 1
import { PrismaClient } from '@prisma/client';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

// 2
beforeEach(() => {
  mockReset(prisma);
});

// 3
const prisma = mockDeep<PrismaClient>();
export default prisma;
