import Stripe from 'stripe';
import path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '..', '.env.stripe') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export const createCustomer = async (email: string) => {
  return await stripe.customers.create({ email });
};

export const createPaymentIntent = async (amount: number, currency: string) => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method_types: ['card'],
  });
};

export const createSubscription = async (
  customerId: string,
  priceId: string
) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
  });
};

export default stripe;
