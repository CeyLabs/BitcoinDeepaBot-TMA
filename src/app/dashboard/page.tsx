import { Suspense } from "react";
import { WalletScreen } from "@/components/dashboard/wallet/WalletScreen";
import { WalletNews } from "@/components/dashboard/wallet/WalletNews";
import { NewsCarouselSkeleton } from "@/components/dashboard/wallet/NewsCarousel";

// The news carousel is cached feed data (same as the News page).
export const revalidate = 900;

export default function WalletPage() {
  return (
    <WalletScreen
      news={
        // Streams in after the rest of the wallet, so a slow feed never holds up launch.
        <Suspense fallback={<NewsCarouselSkeleton />}>
          <WalletNews />
        </Suspense>
      }
    />
  );
}
