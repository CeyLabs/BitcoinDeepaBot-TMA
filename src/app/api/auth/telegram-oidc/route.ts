import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies a Telegram Login (OIDC) id_token to the backend for verification.
 * Unlike /api/auth/telegram, this has no dev-mode fallback: verifying the
 * JWT's signature requires fetching Telegram's JWKS, which only makes sense
 * to do once, on the backend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.API_BASE_URL}/auth/telegram-oidc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in telegram OIDC auth:", error);
    return NextResponse.json({ error: "Failed to authenticate with Telegram" }, { status: 500 });
  }
}
