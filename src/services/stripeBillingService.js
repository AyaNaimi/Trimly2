import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../utils/supabase';

const STRIPE_RETURN_URL = process.env.EXPO_PUBLIC_STRIPE_RETURN_URL || 'trimly://stripe-return';

async function invokeBillingFunction(name, body = {}) {
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) {
    throw new Error(error.message || 'Stripe billing request failed.');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export const StripeBillingService = {
  async startCheckout(plan) {
    const data = await invokeBillingFunction('stripe-checkout', {
      plan,
      successUrl: STRIPE_RETURN_URL,
      cancelUrl: STRIPE_RETURN_URL,
    });

    if (!data?.url) {
      throw new Error('Stripe did not return a checkout URL.');
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, STRIPE_RETURN_URL);
    return {
      ...data,
      browserResult: result,
    };
  },

  async openCustomerPortal() {
    const data = await invokeBillingFunction('stripe-portal', {
      returnUrl: STRIPE_RETURN_URL,
    });

    if (!data?.url) {
      throw new Error('Stripe did not return a portal URL.');
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, STRIPE_RETURN_URL);
    return {
      ...data,
      browserResult: result,
    };
  },

  async getBillingStatus() {
    return invokeBillingFunction('stripe-billing-status');
  },
};
