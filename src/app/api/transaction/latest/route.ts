import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
    try {
        // Get authorization header
        const headersList = headers();
        const authorization = headersList.get("authorization");

        if (!authorization) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                    message: "Authorization header is required",
                },
                { status: 401 }
            );
        }

        // Extract token from "Bearer <token>" format
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : authorization;

        // Make request to external API to get current user transactions
        const response = await fetch(`${process.env.API_BASE_URL}/transaction/latest`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                // No transactions found
                return NextResponse.json(
                    {
                        transactions: [],
                        message: "No transactions found",
                    },
                    { status: 200 }
                );
            }

            const errorData = await response.text();
            return NextResponse.json(
                {
                    error: "Failed to fetch transactions",
                    message: errorData || `HTTP ${response.status}: ${response.statusText}`,
                },
                { status: response.status }
            );
        }

        const transactions = await response.json();
        let latest = null;

        // Check if response is a single transaction object
        if (transactions && typeof transactions === "object" && transactions.payhere_pay_id) {
            latest = transactions;
        } else if (Array.isArray(transactions) && transactions.length > 0) {
            latest = transactions[0];
        } else if (
            Array.isArray(transactions.transactions) &&
            transactions.transactions.length > 0
        ) {
            latest = transactions.transactions[0];
        }

        return NextResponse.json({
            transactions: latest ? [latest] : [],
            message: latest ? "Latest transaction fetched successfully" : "No transactions found",
        });
    } catch (error) {
        console.error("❌ Error fetching latest transaction:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
