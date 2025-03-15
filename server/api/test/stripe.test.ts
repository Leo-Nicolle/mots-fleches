import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import stripe, {
  createPaymentIntent,
  createSubscription,
} from '../src/services/stripe';
import authRouter from '../src/routes/auth';
import secureRouter from '../src/routes/secure';
import express from 'express';
import passport from '../src/config/passport';
import prisma from '../src/prisma';
import { hashPassword } from '../src/services/auth';

const app = express();
app.use(express.json());
passport(app);
app.use('/api/auth', authRouter);
app.use('/api/payments', secureRouter);

const user = {
  email: 'payment-tests@example.com',
  password: 'password123',
};
let token = '';
describe('Stripe Service Tests', () => {
  beforeAll(async () => {
    const hashedPassword = await hashPassword(user.password);
    await prisma.users.create({
      data: {
        email: user.email,
        password: hashedPassword,
        tier_id: 1,
      },
    });
    token = await request(app).post('/api/auth/login').send(user);
  });
  afterAll(async () => {
    const { stripe_id } =
      (await prisma.$queryRaw`SELECT stripe_id FROM users WHERE email = ${user.email}`) as {
        stripe_id: string;
      };
    if (stripe_id) {
      await stripe.customers.del(stripe_id);
    }
    await prisma.users.delete({ where: { email: user.email } });
  });

  it('should retrieve products', async () => {
    const products = await request(app).get('/api/payments/options');
    expect(products.status).toBe(200);
    console.log(products.body);
    expect(products.body.publishableKey).toBeDefined();
    expect(products.body.prices).toBeDefined();
    // const productId = 'yearly_subscription';
    // const paymentIntent = await createPaymentIntent(productId);

    // expect(paymentIntent).toBeDefined();
    // expect(paymentIntent.id).toBe('pi_mock_123');
    // expect(paymentIntent.client_secret).toBe('mock_client_secret_123');
  });
  /*
  it('should create a subscription successfully', async () => {
    const customerId = 'cus_mock_123';
    const priceId = 'price_mock_123';
    const subscription = await createSubscription(customerId, priceId);

    expect(subscription).toBeDefined();
    expect(subscription.id).toBe('sub_mock_123');
    expect(subscription.status).toBe('active');
    expect(subscription.latest_invoice.payment_intent.status).toBe('succeeded');
  });*/
});
