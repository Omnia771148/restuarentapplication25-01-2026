import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../lib/mongoose";
import RestuarentUser from "../../../../models/RegisterUser";

export async function GET(request) {
    // Optimization 1: Check if already connected to avoid overhead
    if (mongoose.connection.readyState === 0) {
        await connectionToDatabase();
    }

    try {
        const { searchParams } = new URL(request.url);
        const restId = searchParams.get("restId");

        if (!restId) {
            return NextResponse.json(
                { success: false, message: "Restaurant ID is required" },
                { status: 400 }
            );
        }

        // Optimization 2 & 3: Select only needed fields and use .lean() for speed
        const user = await RestuarentUser.findOne({ restId })
            .select("email phone restLocation") // Fetch ONLY these fields
            .lean(); // Return plain JS object (faster than Mongoose doc)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user, // Already minimal object thanks to .select()
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
