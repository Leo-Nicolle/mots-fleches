import { Router } from 'express';
import { users as User } from '@prisma/client';
import stripe, {
  createPaymentIntent,
  createSubscription,
  getBillingDetails,
  getPlans,
} from '../services/stripe';
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
router.post('/billing-details', authMiddleware, async (req, res) => {
  const user = req.user as User;
  if (!user) return;
  try {
    const billingDetails = req.body as {
      name: string;
      email: string;
      address: string;
      city: string;
      zip: string;
    };
    await stripe.customers.update(user.stripe_id!, {
      name: billingDetails.name,
      email: billingDetails.email,
      address: {
        line1: billingDetails.address,
        city: billingDetails.city,
        postal_code: billingDetails.zip,
      },
    });
    res.send({ message: 'Billing details updated' });
  } catch (error) {
    console.error('Error fetching tier information:', error);
    res.status(500).send({ error: 'Failed to fetch tier information' });
  }
});
router.get('/billing-details', authMiddleware, async (req, res) => {
  try {
    const user = req.user as User;
    if (!user?.stripe_id) {
      res
        .status(400)
        .send({ error: 'User does not have a Stripe customer ID' });
      return;
    }
    const billingDetails = await getBillingDetails(user.stripe_id);
    if (billingDetails.deleted) {
      res.status(404).send({ error: 'Customer not found in Stripe' });
      return;
    }
    res.json(billingDetails); // Send the response back to the client
  } catch (error) {
    console.error('Error fetching billing details:', error);
    res.status(500).send({ error: 'Failed to fetch billing details' });
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

router.post('/subscribe', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const user = req.user as User; // Authenticated user
    const planId = req.body.planId; // Price ID sent from the client

    if (!user.stripe_id) {
      return res
        .status(400)
        .send({ error: 'User does not have a Stripe customer ID' });
    }
    // Create the subscription
    const subscription = await createSubscription(user.stripe_id, planId);

    // Return the client secret for payment confirmation
    const client_secret =
      (subscription.latest_invoice as any)?.payment_intent?.client_secret;
    if (!client_secret) {
      return res.status(500).send({ error: 'Failed to create subscription' });
    }

    res.status(200).send({ client_secret });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(400).send({ error: 'Error creating subscription' });
  }
});
router.post('/payment-intent', authMiddleware, async (req, res) => {
  if (!req.user) return;
  try {
    const user = req.user as User;
    const productId = req.body.productId;
    const paymentIntent = await createPaymentIntent(productId, user.stripe_id!);
    res.status(200).send({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.log('Error on payment intent:', error);
    res.status(400).send({ error: 'Error on payment intent' });
    return;
  }
});

router.get('/invoice-preview', authMiddleware, async (req, res) => {
  const user = req.user as User;
  const customerId = user.stripe_id;
  const subscription = await stripe.subscriptions.retrieve(
    req.query.subscriptionId as string
  );

  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: customerId ?? undefined,
    subscription: req.query.subscriptionId as string,
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
