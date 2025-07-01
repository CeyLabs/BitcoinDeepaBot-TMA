import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(`${process.env.API_BASE_URL}/package`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const packages = await response.json();
            return NextResponse.json(packages);
        }
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to fetch packages",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
