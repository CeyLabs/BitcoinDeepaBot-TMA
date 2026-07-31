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

export const MOCK_GIFTS: ActivityItem[] = [
  {
    id: "gift-1",
    type: "gift_sent",
    counterparty: "shawnS",
    timestamp: at(0, 17, 0),
    sats: -4814,
    lkr: 1000,
    statusDot: "orange",
    settlement: settlement({ settledOn: at(0, 17, 0) }),
  },
  {
    id: "gift-2",
    type: "gift_received",
    counterparty: "shawnS",
    timestamp: at(0, 17, 0),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(0, 17, 0) }),
  },
  {
    id: "gift-3",
    type: "gift_sent",
    counterparty: "nadeeK",
    timestamp: at(2, 12, 15),
    sats: -4814,
    lkr: 45700,
    statusDot: "orange",
    settlement: settlement({ settledOn: at(2, 12, 15) }),
  },
  {
    id: "gift-4",
    type: "gift_received",
    counterparty: "malshaP",
    timestamp: at(5, 9, 30),
    sats: 4814,
    lkr: 45700,
    settlement: settlement({ settledOn: at(5, 9, 30) }),
  },
];
