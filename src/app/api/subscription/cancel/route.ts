import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
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

        // Forward the request to the external API
        const response = await fetch(`${process.env.API_BASE_URL}/subscription/cancel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        // Get the response from the external API
        const responseData = await response.json();

        // Return the response with the appropriate status code
        return NextResponse.json(responseData, { status: response.status });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        return NextResponse.json(
            {
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
