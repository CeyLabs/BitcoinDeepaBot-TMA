import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    // Get authorization header
    const headersList = await headers();
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
    const limit = url.searchParams.get("limit") || "100";
    const offset = url.searchParams.get("offset") || "0";

    // Build API URL with pagination parameters
    const apiUrl = new URL(`${process.env.API_BASE_URL}/transaction/bot-history`);
    apiUrl.searchParams.set("limit", limit);
    apiUrl.searchParams.set("offset", offset);

    // Make request to external API to get current user's bot (sats send/receive) transactions
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        {
          error: "Failed to fetch bot transactions",
          message: errorData || `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching bot transactions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
