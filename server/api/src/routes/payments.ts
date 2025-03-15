import { Router } from 'express';
import { users as User } from '@prisma/client';
import stripe, { createSubscription, getPlans } from '../services/stripe';
import { type Invoice } from '@stripe/stripe-js';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/plans', async (req, res) => {
  try {
    const plans = await getPlans();
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      plans,
    });
  } catch (error) {
    console.error('Error fetching tier information:', error);
    res.status(500).send({ error: 'Failed to fetch tier information' });
  }
});

router.get('/options', async (req, res) => {
  try {
    const prices = await stripe.prices.list();
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      prices: prices.data,
    });
  } catch (error) {
    console.error('Error fetching pricing options:', error);
    res.status(500).send({ error: 'Failed to fetch pricing options' });
  }
});
/*
router.post('/create-customer', authMiddleware, async (req, res) => {
  // Create a new customer object
  try {
    const user = req.user as User;
    if (user.stripe_id) {
      const customer = await stripe.customers.retrieve(user.stripe_id);
      res.send({ customer: customer });
      return;
    }
    const customer = await stripe.customers.create({
      email: user.email,
    });
    // update user with stripe_id
    await prisma.users.update({
      where: { id: user.id },
      data: {
        stripe_id: customer.id,
      },
    });
    res.send({ customer: customer });
  } catch (error) {
    res.status(400).send({ error: { message: 'Error creating custommer' } });
    return;
  }
});*/

router.post('/create-subscription', authMiddleware, async (req, res) => {
  try {
    const user = req.user! as User;
    const customer = await stripe.customers.retrieve(user.stripe_id!);
    const priceID = req.body.priceId;
    const subscription = await createSubscription(customer.id, priceID);

    res.send({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Invoice).payment_intent
        .client_secret,
    });
  } catch (error) {
    res.status(400).send({ error: 'Error creating subscription' });
    return;
  }
});

router.get('/invoice-preview', authMiddleware, async (req, res) => {
  const user = req.user as User;
  const customerId = user.stripe_id;
  const subscription = await stripe.subscriptions.retrieve(
    req.query.subscriptionId
  );

  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
    subscription: req.query.subscriptionId,
    subscription_items: [
      {
        id: subscription.items.data[0].id,
        // price: priceId,
      },
    ],
  });

  res.send({ invoice });
});

router.post('/cancel-subscription', authMiddleware, async (req, res) => {
  // Cancel the subscription
  try {
    const deletedSubscription = await stripe.subscriptions.cancel(
      req.body.subscriptionId
    );
    res.send({ subscription: deletedSubscription });
  } catch (error) {
    res
      .status(400)
      .send({ error: { message: `Error canceling subscription` } });
    return;
  }
});

router.post('/update-subscription', authMiddleware, async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(
      req.body.subscriptionId
    );
    const updatedSubscription = await stripe.subscriptions.update(
      req.body.subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: process.env[req.body.newPriceLookupKey.toUpperCase()],
          },
        ],
      }
    );

    res.send({ subscription: updatedSubscription });
  } catch (error) {
    res.status(400).send({ error: 'Error retrieving subscription' });
    return;
  }
});

router.get('/subscriptions', authMiddleware, async (req, res) => {
  const customerId = req.cookies['customer'];
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method'],
  });

  res.json({ subscriptions });
});

export default router;
