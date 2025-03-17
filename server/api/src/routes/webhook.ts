import { default as express } from 'express';
import stripe, { parseNickName } from '../services/stripe';
import config from '../services/env';
import prisma from '../prisma';
import Stripe from 'stripe';

const router = express.Router();
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    console.log('ICI');
    const sig = req.headers['stripe-signature'] as string;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (err) {
      console.log(err);
      console.log(`⚠️  Webhook signature verification failed.`);
      console.log(
        `⚠️  Check the env file and enter the correct webhook secret.`
      );
      res.sendStatus(400);
      return;
    }

    // Extract the object from the event.
    const dataObject = event.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    console.log(event.type);
    switch (event.type) {
      // case 'payment_intent.succeeded': {
      //   const paymentIntent = dataObject as Stripe.PaymentIntent;
      //   const stripe_id =
      //     typeof paymentIntent.customer === 'string'
      //       ? paymentIntent.customer
      //       : paymentIntent.customer.id;
      //   const user = await prisma.users.findFirst({
      //     where: { stripe_id },
      //   });
      //   if (!user) {
      //     break;
      //   }
      //   const tierId = paymentIntent.metadata.tierId;
      //   if (!tierId) {
      //     break;
      //   }
      //   await prisma.users.update({
      //     where: { id: user.id },
      //     data: { tier_id: Number(tierId) },
      //   });
      //   console.log('PaymentIntent was successful!');
      //   break;
      // }
      case 'customer.subscription.deleted': {
        const subscription = dataObject as Stripe.Subscription;
        const stripe_id =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;
        const user = await prisma.users.findFirst({
          where: { stripe_id },
        });
        if (!user) {
          break;
        }
        await prisma.users.update({
          where: { id: user.id },
          data: { tier_id: 1 },
        });
        break;
      }
      case 'invoice.payment_succeeded': {
        console.log('invoice.payment_succeeded');
        const invoice = dataObject as Stripe.Invoice;
        if (
          invoice.billing_reason !== 'subscription_create' ||
          !invoice.customer
        )
          break;
        const planName = invoice.lines.data
          .map((line) => {
            return line.plan ? line.plan.nickname : null;
          })
          .find((e) => e);

        const stripe_id =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer.id;
        const user = await prisma.users.findFirst({
          where: { stripe_id },
        });
        console.log(planName, user);
        if (!planName || !user) {
          break;
        }
        const { name, period, tierId } = parseNickName(planName);
        if (!name || !period || !tierId) {
          break;
        }
        console.log(tierId, period);

        await prisma.users.update({
          where: { id: user.id },
          data: { tier_id: tierId },
        });
        break;
      }
      case 'invoice.payment_failed':
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case 'invoice.finalized':
        // If you want to manually send out invoices to your customers
        // or store them locally to reference to avoid hitting Stripe rate limits.
        break;
      case 'customer.subscription.trial_will_end':
        // Send notification to your user that the trial will end
        break;
      default:
      // Unexpected event type
    }
    res.sendStatus(200);
  }
);
export default router;
