import nock from 'nock';

const STRIPE_API_BASE = 'https://api.stripe.com';
const STRIPE_API_VERSION = '/v1';

export const setupStripeMocks = () => {
  // Mock payment intent creation
  nock(STRIPE_API_BASE)
    .post(`${STRIPE_API_VERSION}/payment_intents`)
    .reply(200, {
      id: 'pi_mock_123',
      client_secret: 'mock_client_secret_123',
    });

  // Mock subscription creation
  nock(STRIPE_API_BASE)
    .post(`${STRIPE_API_VERSION}/subscriptions`)
    .reply(200, {
      id: 'sub_mock_123',
      status: 'active',
      items: [{ id: 'si_mock_123' }],
      latest_invoice: {
        payment_intent: {
          status: 'succeeded',
        },
      },
    });
};
