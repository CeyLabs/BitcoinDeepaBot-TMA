import connect from "@/db/connect";
import User from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

        // Check if the user already exists
        const existingUser = await User.findOne({ id });

        if (existingUser) {
            return NextResponse.json({
                status: 409, // HTTP status code for Conflict
                message: "User already exists.",
            });
        }

        // Create a new user
        const newUser = new User({ id, username });
        await newUser.save();

        return NextResponse.json({
            status: 201, // HTTP status code for Created
            message: "User created successfully.",
            user: newUser,
        });
    } catch (e) {
        return NextResponse.json({
            status: 500,
            message: "Error processing request.",
        });
    }
}
