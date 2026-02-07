
import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import RestuarentUser from "../../../../models/RegisterUser";

export async function POST(req) {
    try {
        await connectionToDatabase();
        const body = await req.json();
        const { restId, token, platform } = body;

        console.log("📥 RECEIVED FCM TOKEN REGISTRATION:", { restId, platform, tokenSnippet: token?.substring(0, 10) + "..." });

        if (!restId || !token) {
            return NextResponse.json(
                { success: false, message: "Missing restId or token" },
                { status: 400 }
            );
        }

        const updateField = platform === 'mobile' ? { mobileFcmToken: token } : { fcmToken: token };

        // Try finding by string first, then potentially number if your DB uses mixed types
        let updatedUser = await RestuarentUser.findOneAndUpdate(
            { restId: String(restId) },
            { $set: updateField },
            { new: true }
        );

        if (!updatedUser) {
            console.log(`⚠️ User not found for restId: ${restId}. Checking as Number...`);
            updatedUser = await RestuarentUser.findOneAndUpdate(
                { restId: Number(restId) },
                { $set: updateField },
                { new: true }
            );
        }

        if (!updatedUser) {
            console.error(`❌ FAILED TO SAVE TOKEN: Restaurant ${restId} not found in database.`);
            return NextResponse.json(
                { success: false, message: `Restaurant ${restId} not found. Please check your ID.` },
                { status: 404 }
            );
        }

        console.log(`✅ SUCCESS: Token saved for ${updatedUser.email} (ID: ${restId})`);
        return NextResponse.json({
            success: true,
            message: "Token saved successfully",
        });
    } catch (error) {
        console.error("🔥 Error saving FCM token:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error: " + error.message },
            { status: 500 }
        );
    }
}
