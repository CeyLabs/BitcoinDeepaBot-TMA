import type { Subscription, DCSummary, SubscriptionPlan } from "@/lib/types";

// No backend/auth token wired up in this dev environment yet — fall back to mock
// data (instead of an all-zero layout) so the UI can be reviewed visually. Only
// kicks in once the query has actually settled with nothing, never during loading.
// Shared between the Wallet and Plans v2 pages so their figures agree.
export const MOCK_WALLET_SUMMARY: DCSummary = {
  dca: { balance: 107000, spent: 32000, avg_btc_price: 29500000 },
  total_balance: 107000,
  total_lkr: "40000",
  currency: "LKR",
  "24_hr_change": 2.15,
};

export const MOCK_SUBSCRIPTION: Subscription = {
  id: "mock",
  planName: "Shrimp",
  planType: "weekly",
  price: 1000,
  currency: "LKR",
  startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
  endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  isActive: true,
};

export const MOCK_TRANSACTIONS = [
  {
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    satoshis_purchased: 107000,
    btc_price_at_purchase: 29500000,
    package_amount: 32000,
    status: "SUCCESS",
  },
];

// Placeholder — no real FX rate source exists yet.
export const MOCK_LKR_USD_RATE = 453.8;

export const MOCK_PACKAGES: SubscriptionPlan[] = [
  {
    id: "mock-shrimp-weekly",
    name: "Shrimp",
    type: "weekly",
    amount: 3000,
    currency: "LKR",
    features: ["Basic membership benefits"],
    popular: true,
  },
  {
    id: "mock-shrimp-monthly",
    name: "Shrimp",
    type: "monthly",
    amount: 12000,
    currency: "LKR",
    features: ["Basic membership benefits"],
    popular: true,
  },
  {
    id: "mock-crab-weekly",
    name: "Crab",
    type: "weekly",
    amount: 5000,
    currency: "LKR",
    features: ["Enhanced benefits & faster support"],
  },
  {
    id: "mock-crab-monthly",
    name: "Crab",
    type: "monthly",
    amount: 20000,
    currency: "LKR",
    features: ["Enhanced benefits & faster support"],
  },
  {
    id: "mock-shark-weekly",
    name: "Shark",
    type: "weekly",
    amount: 10000,
    currency: "LKR",
    features: ["Premium benefits & priority support"],
  },
  {
    id: "mock-shark-monthly",
    name: "Shark",
    type: "monthly",
    amount: 40000,
    currency: "LKR",
    features: ["Premium benefits & priority support"],
  },
];
