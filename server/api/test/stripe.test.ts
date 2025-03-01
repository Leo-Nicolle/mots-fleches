import { describe, it, expect, beforeAll } from 'vitest';
import { setupStripeMocks } from './mocks/stripe';
import {
  createPaymentIntent,
  createSubscription,
} from '../src/services/stripe';
import dotenv from 'dotenv';

dotenv.config();

describe.skip('Stripe Service Tests', () => {
  beforeAll(() => {
    setupStripeMocks(); // Setup Stripe mocks before running tests
  });

  it('should create a payment intent successfully', async () => {
    const productId = 'yearly_subscription';
    const paymentIntent = await createPaymentIntent(productId);

    expect(paymentIntent).toBeDefined();
    expect(paymentIntent.id).toBe('pi_mock_123');
    expect(paymentIntent.client_secret).toBe('mock_client_secret_123');
  });

  it('should create a subscription successfully', async () => {
    const customerId = 'cus_mock_123';
    const priceId = 'price_mock_123';
    const subscription = await createSubscription(customerId, priceId);

    expect(subscription).toBeDefined();
    expect(subscription.id).toBe('sub_mock_123');
    expect(subscription.status).toBe('active');
    expect(subscription.latest_invoice.payment_intent.status).toBe('succeeded');
  });
});
