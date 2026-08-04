import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies Telegram Login Widget payloads to the backend for verification.
 * Unlike /api/auth/telegram, this has no dev-mode fallback: the widget's
 * hash can only be verified with the bot token, which lives on the backend,
 * not in this app.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.API_BASE_URL}/auth/telegram-widget`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in telegram widget auth:", error);
    return NextResponse.json({ error: "Failed to authenticate with Telegram" }, { status: 500 });
  }
}
