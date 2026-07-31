"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Title } from "@telegram-apps/telegram-ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center dark:bg-[#1b2027]">
      <Image
        src="/emoji/animated/exclamation-mark.webp"
        alt="Warning"
        width={96}
        height={96}
        unoptimized
      />

      <Title level="2" weight="2" className="mt-3 max-w-sm leading-snug">
        Page Not Found
      </Title>

      <p className="text-muted-foreground mt-2 max-w-sm text-[15px] dark:text-[#64748b]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <Link href="/" className="mt-8 block w-full max-w-xs">
        <Button mode="filled" size="l" stretched style={{ borderRadius: "12px" }}>
          Back to Home
        </Button>
      </Link>
    </main>
  );
}
