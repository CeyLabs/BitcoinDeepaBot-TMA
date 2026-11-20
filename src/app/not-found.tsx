"use client";

import Link from "next/link";
import { BigEmoji, StatusScreen } from "@/components/auth/StatusScreen";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StatusScreen
      art={<BigEmoji src="/emoji/animated/exclamation-mark.webp" className="animate-float" />}
      title="Page not found"
      actions={
        <Link href="/" className={buttonVariants()}>
          Back to home
        </Link>
      }
    >
      The page you&apos;re looking for doesn&apos;t exist or may have moved.
    </StatusScreen>
  );
}
