import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { telegramId: string } }
) {
    try {
        const { telegramId } = params;

        const response = await fetch(`${process.env.API_BASE_URL}/user/exists/${telegramId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store", // Disable caching
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error checking user existence:", error);
        return NextResponse.json(
            {
                registered: false,
                error: "Error processing request.",
            },
            { status: 500 }
        );
    }
}