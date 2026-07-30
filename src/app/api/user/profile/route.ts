import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));

        const response = await fetch(`${process.env.API_BASE_URL}/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: "An unexpected error occurred while updating the profile.",
            }));
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : "Internal server error",
                success: false,
            },
            { status: 500 }
        );
    }
}
