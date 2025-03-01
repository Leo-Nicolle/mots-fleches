import Stripe from 'stripe';
import { getProductById } from './products';
import './env';
import config from './env';
const stripe = new Stripe(config.stripe.secretKey as string, {
  apiVersion: '2022-11-15',
});

export const createPaymentIntent = async (productId: string) => {
  const product = getProductById(productId);
  if (!product) throw new Error('Invalid product ID');

  return await stripe.paymentIntents.create({
    amount: product.price,
    currency: product.currency,
    description: product.name,
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
