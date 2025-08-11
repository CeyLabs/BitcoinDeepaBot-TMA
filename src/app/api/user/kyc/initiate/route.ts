import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
        }

        const response = await fetch(`${process.env.API_BASE_URL}/user/kyc/initiate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        // If the external API returns an error
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: "An unexpected error occurred while fetching KYC status.",
            }));
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Verification initiation error:", error);
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : "Internal server error",
                success: false,
            },
            { status: 500 }
        );
    }
}
