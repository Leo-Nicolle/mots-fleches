import Stripe from 'stripe';
import './env';
import config from './env';
import plans from '../plans.json';
const stripe = new Stripe(config.stripe.secretKey as string, {
  apiVersion: '2022-11-15',
});

export const createPaymentIntent = async (
  productId: string,
  stripeId: string
) => {
  const plans = await getPlans();
  const product = plans.find((p) => p?.productId === productId);
  if (!product) throw new Error('Invalid product ID');
  return await stripe.paymentIntents.create({
    amount: product.price,
    currency: product.currency,
    customer: stripeId,
    description: product.name,
    metadata: {
      productId,
      period: product.period,
      tierId: product.tierId,
    },
    payment_method_types: ['card'],
  });
};

export const createSubscription = async (
  customerId: string,
  planId: string
) => {
  return await stripe.subscriptions.create({
    customer: customerId, // Stripe customer ID
    items: [{ price: planId }], // The price ID for the subscription
    payment_behavior: 'default_incomplete', // Wait for payment confirmation
    expand: ['latest_invoice.payment_intent'], // Expand the payment intent for client-side confirmation
  });
};
export const getTierName = (tierId: number) => {
  return tierId === 1 ? 'free' : tierId === 2 ? 'standard' : 'premium';
};
export const parseNickName = (nickname: string) => {
  if (!nickname) return {};
  const [_, name, period] = (nickname.match(
    /(free|standard|premium)_(monthly|yearly)/
  ) || []) as [string, `free` | `standard` | `premium`, `monthly` | `yearly`];
  if (!name || !period) return {};
  const tierId = name === 'free' ? 1 : name === 'standard' ? 2 : 3;
  return { name, period, tierId };
};

export const getBillingDetails = async (customerId: string) => {
  const customer = await stripe.customers.retrieve(customerId);
  const empty = {
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  };
  if (!customer || customer.deleted) return { ...empty, deleted: true };
  return {
    name: customer.name || empty.name,
    email: customer.email || empty.email,
    address: customer.address?.line1 || empty.address,
    city: customer.address?.city || empty.city,
    zip: customer.address?.postal_code || empty.zip,
    deleted: false,
  };
};
export const getPlans = async () => {
  const { data: prices } = await stripe.prices.list();
  return prices
    .map((price) => {
      const nickname = price.nickname as string;
      const { name, period, tierId } = parseNickName(nickname);
      if (!name || !period) return null;
      const plan = plans[name];
      return {
        price: price.unit_amount!,
        period,
        tierId,
        currency: price.currency,
        nickname: price.nickname,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        productId: price.product! as string,
        planId: price.id,
        limits: plan.limits,
      };
    })
    .filter((e) => e);
};

export const getCustommer = async (email: string) => {
  const res = await stripe.customers.list({
    email,
  });
  return res.data[0];
};

export const createCustommer = async (email: string) => {
  return await stripe.customers.create({
    email,
  });
};

export default stripe;
