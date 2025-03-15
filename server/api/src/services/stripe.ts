import Stripe from 'stripe';
import { getProductById } from './products';
import './env';
import config from './env';
import plans from '../plans.json';
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
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
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

export const getPlans = async () => {
  const { data: prices } = await stripe.prices.list();
  return prices
    .map((price) => {
      const nickname = price.nickname as string;
      const { name, period, tierId } = parseNickName(nickname);
      if (!name || !period) return null;
      console.log(name, period, tierId, plans);
      const plan = plans[name];
      return {
        price: price.unit_amount,
        period,
        tierId,
        currency: price.currency,
        nickname: price.nickname,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        product: price.product,
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
