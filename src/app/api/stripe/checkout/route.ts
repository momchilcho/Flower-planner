import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { stripe, PRICE_IDS, createOrRetrieveCustomer } from "@/lib/stripe";
import type { PriceType } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; email: string; name?: string | null };
  const body = await req.json();
  const { priceType, planId } = body as { priceType: PriceType; planId?: string };

  if (!priceType || !PRICE_IDS[priceType]) {
    return NextResponse.json({ error: "Invalid price type" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const customerId = await createOrRetrieveCustomer(user.id, user.email, user.name);

    const isSubscription = priceType === "monthly" || priceType === "yearly";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "ideal", "bancontact"],
      mode: isSubscription ? "subscription" : "payment",
      line_items: [
        {
          price: PRICE_IDS[priceType],
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/plans${planId ? `?planId=${planId}&upgraded=true` : "?upgraded=true"}`,
      cancel_url: `${baseUrl}/pricing?cancelled=true`,
      metadata: {
        userId: user.id,
        priceType,
        planId: planId ?? "",
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: "auto",
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
