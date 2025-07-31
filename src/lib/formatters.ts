// Format a date as DD/MM/YYYY (Sri Lankan style)
export function formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
}

// Format satoshis to BTC
export function formatSatoshis(satoshis: number): string {
    return (satoshis / 100_000_000).toFixed(8);
}
