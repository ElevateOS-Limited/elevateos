import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      '5 AI study sessions/month',
      '3 worksheets/month',
      'Basic flashcards',
      'Platform chatbot',
    ],
    limits: { studySessions: 5, worksheets: 3 },
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Unlimited AI study sessions',
      'Unlimited worksheets',
      'Past paper simulation',
      'University admissions tool',
      'Internship recommender',
      'PDF exports',
      'Priority AI responses',
    ],
    limits: { studySessions: -1, worksheets: -1 },
  },
  PREMIUM: {
    name: 'Premium',
    monthlyPrice: 39,
    yearlyPrice: 390,
    features: [
      'Everything in Pro',
      'Essay review & feedback',
      '1-on-1 AI tutoring sessions',
      'Application strategy report',
      'Early access to new features',
      'Priority support',
    ],
    limits: { studySessions: -1, worksheets: -1 },
  },
}

export async function createCheckoutSession(params: {
  userId: string
  email: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    customer_email: params.email,
    client_reference_id: params.userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: params.userId },
    },
  })
  return session
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
