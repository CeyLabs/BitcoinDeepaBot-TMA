import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Get the authorization header from the incoming request
        const authHeader = request.headers.get("Authorization");

        if (!authHeader) {
            return NextResponse.json(
                { message: "Authorization header is required" },
                { status: 401 }
            );
        }

        // Forward the request to the external API
        const response = await fetch(`${process.env.API_BASE_URL}/transaction/dca-summary`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        // If the external API returns an error
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            return NextResponse.json(errorData, { status: response.status });
        }

        // Return the successful response data
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error in DCA summary API route:", error);
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
