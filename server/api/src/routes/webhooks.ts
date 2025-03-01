import { Router, Request, Response } from 'express';
import stripe from '../services/stripe';
import bodyParser from 'body-parser';
import config from '../services/env';

const router = Router();
const endpointSecret = config.stripe.webhookSecret;

router.post(
  '/stripe',
  bodyParser.raw({ type: 'application/json' }),
  (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'invoice.payment_succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent);
        // TODO: Update user subscription status in the database
        break;
      case 'invoice.payment_failed':
        console.log('Payment failed:', event.data.object);
        // TODO: Handle payment failure
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
