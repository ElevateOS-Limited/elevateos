import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.user.update({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0].price.id,
            subscriptionStatus: sub.status,
            subscriptionEnds: new Date(sub.current_period_end * 1000),
          },
        })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.user.update({
          where: { stripeCustomerId: sub.customer as string },
          data: { stripeSubscriptionId: null, subscriptionStatus: 'canceled' },
        })
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (e) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
