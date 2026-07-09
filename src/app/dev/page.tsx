"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClickableCard } from "@/components/ui/clickable-card";
import { PlanCard } from "@/components/ui/plan-card";
import { TextField, TextAreaField } from "@/components/ui/text-field";
import { PageTitle } from "@/components/ui/page-title";
import { TogglePlan, PlanDuration } from "@/components/ui/toggle-plan";
import { CategoryFilterGroup } from "@/components/ui/category-filter";
import { SearchField } from "@/components/ui/search-field";
import { CopyField } from "@/components/ui/copy-field";
import BottomNavigation from "@/components/bottomNavigation";

const BitcoinEmoji = () => (
  <span className="text-3xl leading-none">₿</span>
);

const ShrimpEmoji = () => (
  <span className="text-3xl leading-none">🦐</span>
);

const CrabEmoji = () => (
  <span className="text-3xl leading-none">🦀</span>
);

const SharkEmoji = () => (
  <span className="text-3xl leading-none">🦈</span>
);

export default function DevPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("shrimp");
  const [textValue, setTextValue] = useState("");
  const [duration, setDuration] = useState<PlanDuration>("weekly");
  const [category, setCategory] = useState("All");

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-32">
      <div className="mx-auto max-w-md px-4 py-8 space-y-10">

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#475569] hover:text-[#1b2027]"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1b2027]">Component Preview</h1>
          <p className="text-sm text-[#475569] mt-1">Bitcoin Deepa Design System</p>
        </div>

        {/* BUTTONS */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Buttons</h2>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="success">Success Button</Button>
          <Button variant="primary" loading>Loading...</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <div className="flex gap-2">
            <Button variant="primary" size="auto" className="px-6">Auto</Button>
            <Button variant="secondary" size="auto" className="px-6">Auto</Button>
          </div>
        </section>

        {/* CLICKABLE CARDS */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Clickable Cards</h2>
          <ClickableCard
            icon={<BitcoinEmoji />}
            title="Subscribe to a Plan"
            subtitle="Choose Monthly or yearly subscriptions"
            onClick={() => alert("Card clicked!")}
          />
          <ClickableCard
            icon={<span className="text-3xl">📈</span>}
            title="View Transaction History"
            subtitle="See all your membership rewards"
            onClick={() => alert("History clicked!")}
          />
          <ClickableCard
            icon={<span className="text-3xl">🔒</span>}
            title="Disabled Card"
            subtitle="This card cannot be clicked"
            status="disabled"
          />
        </section>

        {/* PLAN CARDS */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Plan Cards</h2>
          <PlanCard
            emoji={<ShrimpEmoji />}
            name="Shrimp"
            price="Rs 3,000"
            period="/week"
            description="Basic membership benefits"
            perMonth="Per Month Rs 12,000"
            perYear="Per Year Rs 144,000"
            selected={selectedPlan === "shrimp"}
            onSelect={() => setSelectedPlan("shrimp")}
          />
          <PlanCard
            emoji={<CrabEmoji />}
            name="Crab"
            price="Rs 5,000"
            period="/week"
            description="Standard membership benefits"
            perMonth="Per Month Rs 20,000"
            perYear="Per Year Rs 240,000"
            selected={selectedPlan === "crab"}
            onSelect={() => setSelectedPlan("crab")}
          />
          <PlanCard
            emoji={<SharkEmoji />}
            name="Shark"
            price="Rs 10,000"
            period="/week"
            description="Premium membership benefits"
            perMonth="Per Month Rs 40,000"
            perYear="Per Year Rs 480,000"
            selected={selectedPlan === "shark"}
            onSelect={() => setSelectedPlan("shark")}
          />
        </section>

        {/* PAGE TITLE */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Page Title</h2>
          <PageTitle title="Choose Your Plan" subtitle="Get your bitcoin දීප membership" />
          <PageTitle title="My Wallet" />
        </section>

        {/* TOGGLE PLAN */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Toggle Plan</h2>
          <div className="flex justify-center">
            <TogglePlan value={duration} onChange={setDuration} />
          </div>
          <p className="text-xs text-center text-[#64748b]">Selected: {duration}</p>
        </section>

        {/* COPY FIELD */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Copy Field</h2>
          <CopyField value="0x1a2b3c4d5e6f7g8h9i0j" />
          <CopyField value="https://t.me/BitcoinDeepaBot?start=ref123" />
        </section>

        {/* SEARCH FIELD */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Search Field</h2>
          <SearchField placeholder="Search" className="w-full" />
        </section>

        {/* CATEGORY FILTER */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Category Filter</h2>
          <CategoryFilterGroup
            options={["All", "Deposits", "Rewards", "Withdrawals"]}
            value={category}
            onChange={setCategory}
          />
          <p className="text-xs text-[#64748b]">Selected: {category}</p>
        </section>

        {/* TEXT FIELDS */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Text Fields</h2>
          <TextField
            placeholder="@username"
            label="Username"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
          <TextField
            placeholder="Enter amount"
            label="Amount (Rs)"
            type="number"
          />
          <TextField
            placeholder="disabled@example.com"
            label="Disabled field"
            state="disabled"
          />
          <TextField
            placeholder="invalid input"
            label="With error"
            error="This field is required"
          />
          <TextAreaField
            placeholder="Write something..."
            label="Paragraph field"
            rows={4}
          />
        </section>

      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNavigation />
    </div>
  );
}
