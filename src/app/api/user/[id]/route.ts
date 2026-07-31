import connect from "@/db/connect";
import User from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await connect();

        const position = await User.countDocuments({ id });

        return NextResponse.json({
            status: 200,
            position,
        });
    } catch (e) {
        return NextResponse.json({
            status: 500,
            message: "Error processing request.",
        });
    }
}
