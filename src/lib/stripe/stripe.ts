import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['5 AI requests/day', 'Basic study tools', '1 essay review/month'],
  },
  PRO_MONTHLY: {
    name: 'Pro Monthly',
    price: 19,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    features: ['Unlimited AI requests', 'All study tools', 'Unlimited essays', 'Past paper simulation', 'Internship recommender'],
  },
  PRO_YEARLY: {
    name: 'Pro Yearly',
    price: 149,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID,
    features: ['Everything in Pro Monthly', '2 months free', 'Priority support', 'Early access to features'],
  },
}
