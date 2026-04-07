import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const priceType = session.metadata?.priceType;

        if (!userId) break;

        if (session.mode === "payment") {
          // One-time payment
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: "ONE_TIME",
              subStatus: "ACTIVE",
            },
          });
        } else if (session.mode === "subscription") {
          // Subscription
          const tier = priceType === "yearly" ? "PRO_YEARLY" : "PRO_MONTHLY";
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier,
              subStatus: "ACTIVE",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeId: subscription.customer as string },
        });

        if (!user) break;

        const status = subscription.status;
        let subStatus: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "NONE" = "NONE";

        if (status === "active" || status === "trialing") subStatus = "ACTIVE";
        else if (status === "past_due") subStatus = "PAST_DUE";
        else if (status === "canceled" || status === "unpaid") subStatus = "CANCELLED";

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subStatus,
            subEndDate: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeId: subscription.customer as string },
        });

        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            tier: "FREE",
            subStatus: "CANCELLED",
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const user = await prisma.user.findFirst({
          where: { stripeId: invoice.customer as string },
        });

        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: { subStatus: "PAST_DUE" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
