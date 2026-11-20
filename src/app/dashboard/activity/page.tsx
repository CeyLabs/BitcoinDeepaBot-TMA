"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ActivitySearchBar } from "@/components/dashboard/activity/ActivitySearchBar";
import { ActivityTabs } from "@/components/dashboard/activity/ActivityTabs";
import { ActivityGroup } from "@/components/dashboard/activity/ActivityGroup";
import { ActivitySkeleton } from "@/components/dashboard/activity/ActivitySkeleton";
import { ActivityEmpty } from "@/components/dashboard/activity/ActivityEmpty";
import { Button } from "@/components/ui/button";
import { haptic } from "@/platform";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";
import { useBotTransactionHistory } from "@/hooks/query/useBotTransactionHistory";
import { useRefreshWhenSalesSettle } from "@/hooks/query/useSell";
import {
  ACTIVITY_TITLE,
  getActivityCategory,
  mapBotTransactionToActivityItem,
  mapDcaTransactionToActivityItem,
  mapSellOrderToActivityItem,
  type ActivityCategory,
} from "@/lib/activity";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";

/** How long to wait for every source before showing the ones that are in. */
const COMBINED_WAIT_MS = 4000;

// Tipjar/faucet/gift and tasks have no backend endpoint yet.
const COMING_SOON_CATEGORIES: ActivityCategory[] = ["tasks"];

export default function ActivityPage() {
  const { visible: balanceVisible, toggle: toggleBalanceVisible } = useBalanceVisible();
  const [search, setSearch] = useState("");
  // The input updates on every key press; the (possibly long) list re-filters
  // with the deferred value, so typing never waits on it.
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState<ActivityCategory>("all");

  // Plan charges show on Plans, one-time buys and sales on Transactions: all
  // come from the member's history
  const showDca = category !== "tasks";
  const showBotHistory = category === "all" || category === "transactions";

  // Only fetch the sources the current tab actually shows.
  const dca = useTransactionHistory({ enabled: showDca });
  const botHistory = useBotTransactionHistory({ enabled: showBotHistory });
  // A sale still moving is followed on its own; the history reloads once it settles
  useRefreshWhenSalesSettle(dca.sales);

  const activity = useMemo(() => {
    // The bot transfer that paid a sale is hidden below; its memo goes on the sale
    const saleMemos = new Map(
      botHistory.transactions
        .filter((tx) => tx.sale_payment && tx.sale_order_id && tx.memo)
        .map((tx) => [tx.sale_order_id!, tx.memo!])
    );
    return [
      ...dca.transactions.map(mapDcaTransactionToActivityItem),
      ...dca.sales.map((order) => mapSellOrderToActivityItem(order, saleMemos.get(order.id))),
      // A purchase's sats arrive as a bot transfer, and a sale's leave as a
      // bot payment: the backend marks both, so each shows once
      ...botHistory.transactions
        .filter((tx) => !tx.purchase_settlement && !tx.sale_payment)
        .map(mapBotTransactionToActivityItem),
    ];
  }, [dca.transactions, dca.sales, botHistory.transactions]);

  const dcaLoading = showDca && dca.isLoading;
  const botLoading = showBotHistory && botHistory.isLoading;
  const stillLoading = dcaLoading || botLoading;
  const dcaFailed = showDca && dca.isError;
  const botFailed = showBotHistory && botHistory.isError;
  const isError = dcaFailed || botFailed;
  // Names the source(s) that failed, for the notice shown above whatever
  // activity did load.
  const failedLabel =
    dcaFailed && botFailed ? "activity" : dcaFailed ? "purchases and sales" : "transfers";
  const refetch = () => {
    if (showDca && dca.isError) dca.refetch();
    if (showBotHistory && botHistory.isError) botHistory.refetch();
  };
  const hasNextPage = (showDca && dca.hasNextPage) || (showBotHistory && botHistory.hasNextPage);
  const isFetchingNextPage =
    (showDca && dca.isFetchingNextPage) || (showBotHistory && botHistory.isFetchingNextPage);
  const fetchNextPage = () => {
    if (showDca && dca.hasNextPage) dca.fetchNextPage();
    if (showBotHistory && botHistory.hasNextPage) botHistory.fetchNextPage();
  };

  const comingSoon = COMING_SOON_CATEGORIES.includes(category);

  const groups = useMemo(() => {
    if (comingSoon) return [];

    const filtered = activity.filter((item) => {
      const itemCategory = getActivityCategory(item.type);
      if (category !== "all" && itemCategory !== category) {
        return false;
      }
      if (!deferredSearch.trim()) return true;

      const query = deferredSearch.trim().toLowerCase();
      return (
        ACTIVITY_TITLE[item.type].toLowerCase().includes(query) ||
        item.counterparty?.toLowerCase().includes(query) ||
        item.detailLabel?.toLowerCase().includes(query)
      );
    });

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const byDay = new Map<string, typeof sorted>();
    for (const item of sorted) {
      const dayKey = format(new Date(item.timestamp), "yyyy-MM-dd");
      const bucket = byDay.get(dayKey);
      if (bucket) bucket.push(item);
      else byDay.set(dayKey, [item]);
    }

    return Array.from(byDay.entries());
  }, [activity, comingSoon, deferredSearch, category]);

  // Wait for every source so the list appears once, already merged (rows
  // don't pop in between others). A slow source (the bot API can take its
  // full 10s timeout) only holds it back for COMBINED_WAIT_MS, then whatever
  // loaded shows.
  const [waitedOut, setWaitedOut] = useState(false);
  if (!stillLoading && waitedOut) setWaitedOut(false);
  useEffect(() => {
    if (!stillLoading) return;
    const id = window.setTimeout(() => setWaitedOut(true), COMBINED_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [stillLoading]);
  const isLoading = stillLoading && (groups.length === 0 || !waitedOut);

  const canClear = search.trim() !== "" || category !== "all";
  const clearFilters = () => {
    haptic.select();
    setSearch("");
    setCategory("all");
  };
  // Nothing at all came back (not just filtered out): the first-run copy.
  const nothingYet = activity.length === 0 && !stillLoading && !canClear;

  return (
    <div className="flex w-full flex-col gap-5">
      <ActivitySearchBar
        value={search}
        onChange={setSearch}
        visible={balanceVisible}
        onToggleVisible={toggleBalanceVisible}
      />

      <ActivityTabs value={category} onChange={setCategory} />

      {isLoading ? (
        <ActivitySkeleton />
      ) : comingSoon ? (
        <ActivityEmpty
          title="Task rewards are coming soon"
          body="Sats you earn from tasks will show up here."
          actionLabel="Show all activity"
          onAction={clearFilters}
        />
      ) : isError && groups.length === 0 ? (
        <ActivityEmpty
          title="Couldn't load activity"
          body="Check your connection and try again."
          actionLabel="Try again"
          onAction={refetch}
        />
      ) : groups.length === 0 ? (
        nothingYet ? (
          <ActivityEmpty
            title="No activity yet"
            body="Your purchases, rewards and transfers will show up here."
          />
        ) : (
          <ActivityEmpty
            title="No matches"
            body="Try another search or filter."
            actionLabel={canClear ? "Clear filters" : undefined}
            onAction={clearFilters}
          />
        )
      ) : (
        <>
          {isError && (
            <div
              role="alert"
              className="bg-loss-bg flex items-center justify-between gap-3 rounded-xl py-1 pr-1 pl-4"
            >
              <p className="text-loss text-[13px] font-semibold">
                Couldn&apos;t load {failedLabel}. Showing what loaded.
              </p>
              <Button variant="text" size="text" onClick={refetch} className="shrink-0">
                Try again
              </Button>
            </div>
          )}
          {stillLoading && (
            <p className="text-ink3 animate-pulse-soft text-center text-[13px]">
              Loading {dcaLoading ? "purchases" : "transfers"}…
            </p>
          )}

          {groups.map(([dayKey, items]) => (
            <ActivityGroup
              key={dayKey}
              date={items[0].timestamp}
              items={items}
              visible={balanceVisible}
            />
          ))}

          {hasNextPage && (
            <Button
              variant="secondary"
              size="default"
              onClick={() => fetchNextPage()}
              loading={isFetchingNextPage}
              className="self-center"
            >
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
