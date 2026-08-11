import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Proxies the backend's single unified GET /transaction/history?type=plan|bot|all
// endpoint. Kept server-side because API_BASE_URL is a server-only env var and
// the backend isn't set up for direct browser CORS. Response is passed through
// as-is (no reshaping) — callers unwrap the `plan`/`bot` fields themselves.
export async function GET(request: Request) {
  try {
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

    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : authorization;

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all";
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";

    const apiUrl = new URL(`${process.env.API_BASE_URL}/transaction/history`);
    apiUrl.searchParams.set("type", type);
    apiUrl.searchParams.set("page", page);
    apiUrl.searchParams.set("limit", limit);

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
          error: "Failed to fetch transaction history",
          message: errorData || `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching transaction history:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
