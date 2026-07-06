import type { ActivityItem } from "@/lib/types";

// Returns an ISO timestamp `daysAgo` days back from today at the given local hour/minute.
function at(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function settlement(
  overrides: Partial<ActivityItem["settlement"]> & { settledOn: string }
): ActivityItem["settlement"] {
  return {
    status: "Settlement Success",
    btcSats: 4814,
    btcPriceUsd: 232,
    btcPriceLkr: 20770000,
    transactionId: "e15cdd2a-4482-4512-97dd-c7474dda5029",
    ...overrides,
  };
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "sent",
    counterparty: "shawnS",
    timestamp: at(0, 17, 0),
    sats: -4814,
    lkr: 45700,
    statusDot: "green",
    settlement: settlement({ settledOn: at(0, 17, 0) }),
  },
  {
    id: "2",
    type: "tipjar_sent",
    counterparty: "shawnS",
    timestamp: at(0, 16, 0),
    sats: -4814,
    lkr: 45700,
    statusDot: "green",
    settlement: settlement({ settledOn: at(0, 16, 0) }),
  },
  {
    id: "3",
    type: "received",
    counterparty: "shawnS",
    timestamp: at(0, 15, 0),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(0, 15, 0) }),
  },
  {
    id: "4",
    type: "tipjar_received",
    counterparty: "shawnS",
    timestamp: at(1, 14, 0),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(1, 14, 0) }),
  },
  {
    id: "5",
    type: "faucet_sent",
    counterparty: "shawnS",
    timestamp: at(1, 13, 0),
    sats: -4814,
    lkr: 45700,
    statusDot: "green",
    settlement: settlement({ settledOn: at(1, 13, 0) }),
  },
  {
    id: "6",
    type: "faucet_received",
    counterparty: "shawnS",
    timestamp: at(20, 12, 30),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(20, 12, 30) }),
  },
  {
    id: "7",
    type: "tasks_reward",
    detailLabel: "Share story",
    timestamp: at(20, 12, 0),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(20, 12, 0) }),
  },
  {
    id: "8",
    type: "membership_reward",
    detailLabel: "Shrimp plan",
    timestamp: at(20, 11, 0),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(20, 11, 0) }),
  },
  {
    id: "9",
    type: "gift_sent",
    counterparty: "shawnS",
    timestamp: at(20, 10, 30),
    sats: -4814,
    lkr: 45700,
    statusDot: "orange",
    settlement: settlement({ settledOn: at(20, 10, 30) }),
  },
  {
    id: "10",
    type: "gift_received",
    counterparty: "shawnS",
    timestamp: at(20, 10, 0),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(20, 10, 0) }),
  },
];
