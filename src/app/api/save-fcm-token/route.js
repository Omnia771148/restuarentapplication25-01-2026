
import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import RestuarentUser from "../../../../models/RegisterUser";

export async function POST(req) {
    try {
        await connectionToDatabase();
        const { restId, token, platform } = await req.json();

        if (!restId || !token) {
            return NextResponse.json(
                { success: false, message: "Missing restId or token" },
                { status: 400 }
            );
        }

        const updateField = platform === 'mobile' ? { mobileFcmToken: token } : { fcmToken: token };

        // Find the user by restId and update the fcmToken
        const updatedUser = await RestuarentUser.findOneAndUpdate(
            { restId: restId },
            { $set: updateField },
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
