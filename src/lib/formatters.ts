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
