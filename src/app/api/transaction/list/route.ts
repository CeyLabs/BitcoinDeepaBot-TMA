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

        // Get pagination parameters from URL
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || "1";
        const limit = url.searchParams.get("limit") || "10";

        // Build API URL with pagination parameters
        const apiUrl = new URL(`${process.env.API_BASE_URL}/transaction/list`);
        apiUrl.searchParams.set("page", page);
        apiUrl.searchParams.set("limit", limit);

        // Make request to external API to get current user transactions
        const response = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-cache",
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

        return NextResponse.json({
            transactions,
            message: "Transactions fetched successfully",
        });
    } catch (error) {
        console.error("❌ Error fetching current transactions:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
