import type { Plan, Subscription, PlanSlug } from '../types/database.ts';

export interface CheckoutOptions {
  planSlug: PlanSlug;
  billingInterval: 'month' | 'year';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResult {
  sessionId?: string;
  checkoutUrl?: string;
  isDevelopmentMode: boolean;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createCheckoutSession(options: CheckoutOptions): Promise<CheckoutResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  getBillingPortalUrl(): Promise<string | null>;
}

export interface PlanPricing {
  monthly: number;
  yearly: number;
}

export const PLAN_PRICES: Record<PlanSlug, PlanPricing> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 5.99, yearly: 50.99 },
  premium: { monthly: 20.99, yearly: 75.99 },
};

export const SYSTEM_PLANS: Plan[] = [
  {
    id: 'plan-free',
    name: 'Free Seeker',
    slug: 'free',
    description: 'Essential Islamic inquiries and daily worship guidance.',
    price_amount: 0,
    currency: 'USD',
    billing_interval: 'month',
    message_limit: 5,
    max_tokens: 1500,
    is_active: true,
    features: [
      '5 AI questions every 24 hours',
      'Somali, Arabic, and English language support',
      'Concise educational answers',
      '2-Day Quran Free Trial (Full mushaf & audio reciters)',
      'Digital Tasbeeh & daily Adhkar catalog',
      'Standard response speed',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Talib al-Ilm (Pro)',
    slug: 'pro',
    description: 'For students of knowledge seeking deeper comparative rulings.',
    price_amount: 599, // $5.99/mo, $50.99/yr
    currency: 'USD',
    billing_interval: 'month',
    message_limit: 150,
    max_tokens: 4000,
    is_active: true,
    features: [
      '150 AI questions per day',
      'Scholarly ikhtilaf (four madhhabs comparative views)',
      'Hadith authenticity grading analysis',
      'Includes Quran Pro automatically (Unlimited reading & Qaari reciters)',
      'Subcis alternating recitation practice',
      'Full conversation export (Markdown & JSON)',
      'Faster response speed & priority queue',
    ],
  },
  {
    id: 'plan-premium',
    name: 'Alim Research (Premium)',
    slug: 'premium',
    description: 'Comprehensive research tools with maximum context and depth.',
    price_amount: 2099, // $20.99/mo, $75.99/yr
    currency: 'USD',
    billing_interval: 'month',
    message_limit: 1000,
    max_tokens: 8000,
    is_active: true,
    features: [
      '1,000 AI questions per day',
      'Extended context window for long theological topics',
      'Tafsir & Asbab al-Nuzul in-depth explorer',
      'Includes Quran Premium automatically (All Pro Quran features + Somali Scholars Tafsir)',
      'Khatmah completion planner & progress tracking',
      'Priority access during peak Ramadan hours',
      'Direct primary source reference links',
    ],
  },
];

// Stripe Provider implementation
class StripePaymentProvider implements PaymentProvider {
  name = 'Stripe';

  isConfigured(): boolean {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return Boolean(publishableKey && !publishableKey.includes('placeholder'));
  }

  async createCheckoutSession(options: CheckoutOptions): Promise<CheckoutResult> {
    if (!this.isConfigured()) {
      return {
        isDevelopmentMode: true,
        message: 'Payments are not configured yet. Running in development/demo mode.',
      };
    }

    // Call server checkout endpoint or Supabase Edge function
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      const data = await response.json();
      return {
        sessionId: data.sessionId,
        checkoutUrl: data.url,
        isDevelopmentMode: false,
      };
    } catch (err: any) {
      return {
        isDevelopmentMode: true,
        message: `Stripe checkout initiation: ${err.message}`,
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getBillingPortalUrl(): Promise<string | null> {
    return null;
  }
}

// Development Mock Provider
class DevelopmentPaymentProvider implements PaymentProvider {
  name = 'Development Billing Provider';

  isConfigured(): boolean {
    return true;
  }

  async createCheckoutSession(options: CheckoutOptions): Promise<CheckoutResult> {
    return {
      isDevelopmentMode: true,
      message:
        'Live payment gateway is not yet linked. You are in safe Development Sandbox mode.',
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<boolean> {
    return true;
  }

  async getBillingPortalUrl(): Promise<string | null> {
    return null;
  }
}

const stripeProvider = new StripePaymentProvider();
const devProvider = new DevelopmentPaymentProvider();

export function getPaymentProvider(): PaymentProvider {
  if (stripeProvider.isConfigured()) {
    return stripeProvider;
  }
  return devProvider;
}
