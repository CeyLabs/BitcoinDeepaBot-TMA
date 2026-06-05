"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClickableCard } from "@/components/ui/clickable-card";
import { PlanCard } from "@/components/ui/plan-card";
import { TextField, TextAreaField } from "@/components/ui/text-field";
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

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-32">
      <div className="mx-auto max-w-md px-4 py-8 space-y-10">

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
