// src/services/products.ts

export const products = [
  {
    id: 'yearly_subscription',
    name: 'Yearly Subscription',
    price: 5000, // Price in cents ($50.00 USD)
    currency: 'usd',
  },
].reduce((acc, product) => {
  acc.set(product.id, product);
  return acc;
}, new Map());

export const getProductById = (productId: string) => {
  return products.get(productId) || null;
};
