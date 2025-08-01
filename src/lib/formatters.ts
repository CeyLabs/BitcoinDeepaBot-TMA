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
