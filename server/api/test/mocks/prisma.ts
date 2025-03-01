// test/mocks/prismaClient.ts

const users = new Map<string, any>(); // Mock user storage

export const prisma = {
  users: {
    findUnique: async ({ where: { email, id } }: any) => {
      if (email) {
        return users.get(email) || null;
      }
      if (typeof id == 'number') {
        return (
          Array.from(users.values()).find((user: any) => user.id === id) || null
        );
      }
      return null;
    },
    create: async ({ data }: any) => {
      users.set(data.email, { ...data, id: users.size + 1 });
      return data;
    },
  },
};

export default prisma;
