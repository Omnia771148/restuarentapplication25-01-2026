import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import RestuarentUser from "../../../../models/RegisterUser";

export async function GET(request) {
    await connectionToDatabase();

    try {
        const { searchParams } = new URL(request.url);
        const restId = searchParams.get("restId");

        if (!restId) {
            return NextResponse.json(
                { success: false, message: "Restaurant ID is required" },
                { status: 400 }
            );
        }

        const user = await RestuarentUser.findOne({ restId });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                email: user.email,
                phone: user.phone,
                restLocation: user.restLocation,
            },
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
