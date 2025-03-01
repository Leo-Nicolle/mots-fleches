import prisma from '../prisma';

export const createUser = async (email: string, password: string) => {
  return await prisma.users.create({
    data: {
      email,
      password,
    },
  });
};

export const getUserByEmail = async (email: string) => {
  return await prisma.users.findUnique({
    where: { email },
  });
};
