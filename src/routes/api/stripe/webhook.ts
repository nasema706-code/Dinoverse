import { createFileRoute } from "@tanstack/react-router";
import { fulfillCheckoutSession, getStripe } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripe = getStripe();
        const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!stripe || !secret) {
          return new Response("Stripe webhook is not configured.", { status: 503 });
        }
        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing Stripe signature.", { status: 400 });
        const payload = await request.text();
        let event;
        try {
          event = stripe.webhooks.constructEvent(payload, signature, secret);
        } catch {
          return new Response("Invalid Stripe signature.", { status: 400 });
        }
        if (event.type === "checkout.session.completed") {
          await fulfillCheckoutSession(event.data.object);
        }
        return Response.json({ received: true });
      },
    },
  },
});
