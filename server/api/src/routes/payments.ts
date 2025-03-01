import { Router, Request, Response } from 'express';
import stripe, {
  createPaymentIntent,
  createSubscription,
} from '../services/stripe';

const router = Router();

// Securely create a Payment Intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ error: 'Missing product ID' });

    const paymentIntent = await createPaymentIntent(productId);
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create a Subscription
router.post('/create-subscription', async (req: Request, res: Response) => {
  try {
    const { customerId, priceId } = req.body;
    const subscription = await createSubscription(customerId, priceId);
    res.status(200).json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

export default router;

/**
 * Example client request
 */

/*
async function makePayment() {
  const response = await fetch('/api/payments/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId: 'yearly_subscription',
    }),
  });

  const { clientSecret } = await response.json();
}
*/
