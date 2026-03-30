import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

declare global {
  var stripeClient: Stripe | undefined;
}

export const stripe = global.stripeClient ?? new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

if (process.env.NODE_ENV !== "production") global.stripeClient = stripe;

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? "price_monthly",
  yearly: process.env.STRIPE_PRICE_YEARLY ?? "price_yearly",
  onetime: process.env.STRIPE_PRICE_ONETIME ?? "price_onetime",
} as const;

export const PRICES = {
  monthly: 999, // €9.99 in cents
  yearly: 4999, // €49.99 in cents
  onetime: 2999, // €29.99 in cents
} as const;

export type PriceType = "monthly" | "yearly" | "onetime";

export async function getUserSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      subStatus: true,
      subEndDate: true,
      stripeId: true,
    },
  });

  if (!user) {
    return { isPremium: false, tier: "FREE" as const, subStatus: "NONE" as const };
  }

  const isPremium =
    (user.tier === "PRO_MONTHLY" ||
      user.tier === "PRO_YEARLY" ||
      user.tier === "ONE_TIME") &&
    user.subStatus === "ACTIVE";

  return {
    isPremium,
    tier: user.tier,
    subStatus: user.subStatus,
    subEndDate: user.subEndDate,
  };
}

export async function createOrRetrieveCustomer(userId: string, email: string, name?: string | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeId: true },
  });

  if (user?.stripeId) {
    return user.stripeId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeId: customer.id },
  });

  return customer.id;
}

export function formatStripeAmount(amount: number, currency = "eur"): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}
