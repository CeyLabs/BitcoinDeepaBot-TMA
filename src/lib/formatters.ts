import { format } from "date-fns";

// Format a date as YYYY/MM/DD
export function formatDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    return format(date, "yyyy/MM/dd");
}

// Format satoshis to BTC
export function formatSatoshis(satoshis: number): string {
    return (satoshis / 100_000_000).toFixed(8);
}

// Format large numbers for better readability (e.g., 1000000 -> 1.0M)
export function formatLargeNumber(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1)}B`;
    } else if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(1)}K`;
    } else {
        return amount.toLocaleString();
    }
}

// Format a whole-number LKR amount with thousands separators (e.g. 45700 -> "45,700")
export function fmtLkr(value: number): string {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// Compact satoshi count (e.g. 214000 -> "214K")
export function fmtSatsCompact(sats: number): string {
    if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(1)}M`;
    if (sats >= 1_000) return `${Math.round(sats / 1_000)}K`;
    return sats.toString();
}

// Compact LKR/price amount (e.g. 29500000 -> "29.5M")
export function fmtPriceCompact(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return fmtLkr(value);
}

// Figma-style short date, e.g. "17 Mar '26"
export function fmtShortDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} '${year}`;
}

// Relative day text, e.g. "In 5 days" / "2 days ago" / "Today"
export function fmtRelativeDays(dateInput: string | Date): string {
    const diff = Math.round((new Date(dateInput).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff > 0) return `In ${diff} day${diff !== 1 ? "s" : ""}`;
    return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""} ago`;
}
