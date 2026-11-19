"use client";

import { Bone } from "@/components/ui/bone";
import { CellChevron } from "@/components/ui/cell";
import { KeyValueList, List, ListRow, Section } from "@/components/ui/section";
import { useUserMe } from "@/hooks/query/useUserMe";
import { Icon } from "./icons";

const Value = ({ children }: { children: string | null | undefined }) => (
  <span className="block max-w-[210px] truncate font-sans">{children || "—"}</span>
);

/** The details we hold for the member (filled in before KYC). */
export function PersonalDetailsSection({ onCompleteProfile }: { onCompleteProfile: () => void }) {
  const { data: me, isLoading } = useUserMe();

  if (isLoading) {
    return (
      <Section title="Personal details">
        <div className="bg-chip flex flex-col gap-3.5 rounded-xl px-3.5 py-3.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Bone className="h-3.5 w-14" />
              <Bone className="h-3.5 w-32" />
            </div>
          ))}
        </div>
      </Section>
    );
  }

  const name = [me?.first_name, me?.last_name].filter(Boolean).join(" ");
  const place = [me?.city, me?.country].filter(Boolean).join(", ");

  return (
    <Section title="Personal details">
      <KeyValueList
        rows={[
          { k: "Name", v: <Value>{name}</Value> },
          { k: "Email", v: <Value>{me?.email}</Value> },
          { k: "Phone", v: <Value>{me?.phone}</Value> },
          { k: "City", v: <Value>{place}</Value> },
        ]}
      />
      {me && !me.is_profile_complete && (
        <List>
          <ListRow
            onClick={onCompleteProfile}
            icon={<Icon name="user" className="text-link" />}
            title={<span className="text-link">Complete your profile</span>}
            subtitle="Needed before you verify"
            after={<CellChevron />}
          />
        </List>
      )}
    </Section>
  );
}
