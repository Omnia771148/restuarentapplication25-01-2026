
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        await connectionToDatabase();
        const { restId, token } = await req.json();

        if (!restId || !token) {
            return NextResponse.json(
                { success: false, message: "Missing restId or token" },
                { status: 400 }
            );
        }

        // Find the user by restId and update the fcmToken
        const updatedUser = await RestuarentUser.findOneAndUpdate(
            { restId: restId },
            { $set: { fcmToken: token } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Token saved successfully",
        });
    } catch (error) {
        console.error("Error saving FCM token:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
