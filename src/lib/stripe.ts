import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    if (!publishableKey) {
      console.warn("VITE_STRIPE_PUBLISHABLE_KEY is not set.");
    }
    stripePromise = loadStripe(publishableKey ?? "");
  }
  return stripePromise;
};


