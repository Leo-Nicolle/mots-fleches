import { Router, Request, Response } from 'express';
import { hashPassword, verifyPassword, generateToken } from '../services/auth';
import prisma from '../prisma';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  res
    .status(201)
    .json({ message: 'User registered successfully', userId: newUser.id });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken(user.id);
  res.status(200).json({ token });
});

export default router;
