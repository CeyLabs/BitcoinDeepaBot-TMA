"use client";

import { useRouter } from "next/navigation";
import { Cell, CellChevron } from "@/components/ui/cell";
import { Bone } from "@/components/ui/bone";
import { useUserMe } from "@/hooks/query/useUserMe";
import { haptic } from "@/platform";
import { Section } from "./Section";

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Cell className="[--cell-py:12px]" subtitle={label}>
      {value || "—"}
    </Cell>
  );
}

export function PersonalDetailsCard() {
  const router = useRouter();
  const { data: me, isLoading } = useUserMe();

  if (isLoading) {
    return (
      <Section title="Personal details">
        <div className="flex flex-col gap-3 p-5">
          <Bone className="h-4 w-40" />
          <Bone className="h-4 w-32" />
          <Bone className="h-4 w-36" />
        </div>
      </Section>
    );
  }

  const name = [me?.first_name, me?.last_name].filter(Boolean).join(" ");
  const place = [me?.city, me?.country].filter(Boolean).join(", ");

  return (
    <Section title="Personal details">
      <Row label="Name" value={name} />
      <Row label="Email" value={me?.email} />
      <Row label="Phone" value={me?.phone} />
      <Row label="City" value={place} />
      {me && !me.is_profile_complete && (
        <Cell
          as="button"
          className="text-primary [--cell-py:14px]"
          after={<CellChevron />}
          onClick={() => {
            haptic.impact("light");
            router.push("/verification/details");
          }}
        >
          Complete your profile
        </Cell>
      )}
    </Section>
  );
}
