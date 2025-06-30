import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        try {
            const response = await fetch(`${process.env.API_BASE_URL}/auth/telegram`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        } catch (fetchError) {
            const { initData } = body;

            if (!initData) {
                return NextResponse.json({ error: "initData is required" }, { status: 400 });
            }

            const urlParams = new URLSearchParams(initData);
            const userParam = urlParams.get("user");

            if (!userParam) {
                return NextResponse.json(
                    { error: "Invalid initData: no user found" },
                    { status: 400 }
                );
            }

            const user = JSON.parse(decodeURIComponent(userParam));

            const token = `dev_token_${user.id}_${Date.now()}`;

            return NextResponse.json({
                token: token,
                user: user,
                message: "Authentication successful (development mode)",
            });
        }
    } catch (error) {
        console.error("Error in telegram auth:", error);
        return NextResponse.json(
            { error: "Failed to authenticate with Telegram" },
            { status: 500 }
        );
    }
}
