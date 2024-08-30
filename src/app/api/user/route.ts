import connect from "@/db/connect";
import User from "@/db/schema";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    // get the user count
    try {
        await connect();

        const count = await User.countDocuments();

        return NextResponse.json({
            status: 200,
            count,
        });
    } catch (e) {
        return NextResponse.json({
            status: 500,
            message: "Error processing request.",
        });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const id = body.id;
        const username = body.username;

        await connect();

        const user = await User.findOne({ id });

        if (user) {
            return NextResponse.json({
                status: 200,
                message: "User already exists.",
            });
        }

        await User.create({ id, username });

        return NextResponse.json({
            status: 200,
            message: "User created successfully.",
        });
    } catch (e) {
        return NextResponse.json({
            status: 500,
            message: "Error processing request.",
        });
    }
}
