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
                    message: "Authorization header is required" 
                },
                { status: 401 }
            );
        }

        // Extract token from "Bearer <token>" format
        const token = authorization.startsWith("Bearer ") 
            ? authorization.slice(7) 
            : authorization;

        // Make request to external API to get current subscription
        const response = await fetch(`${process.env.API_BASE_URL}/subscription/current`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                // No subscription found
                return NextResponse.json(
                    { 
                        subscription: null,
                        message: "No active subscription found" 
                    },
                    { status: 200 }
                );
            }
            
            const errorData = await response.text();
            return NextResponse.json(
                {
                    error: "Failed to fetch subscription",
                    message: errorData || `HTTP ${response.status}: ${response.statusText}`,
                },
                { status: response.status }
            );
        }

        const subscription = await response.json();
        
        return NextResponse.json({
            subscription,
            message: "Subscription fetched successfully"
        });

    } catch (error) {
        console.error("❌ Error fetching current subscription:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
