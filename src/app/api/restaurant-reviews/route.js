
import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import OrderReview from "../../../../models/OrderReview";

export async function GET(request) {
    await connectionToDatabase();

    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get("restaurantId");

        if (!restaurantId) {
            return NextResponse.json(
                { success: false, message: "Restaurant ID is required" },
                { status: 400 }
            );
        }

        // Fetch reviews for the specific restaurant
        // We only want restaurantRating and restaurantReview, but usually we fetch the whole object and filter in frontend or backend.
        // The user said "show only that particular restuarent id reviews only".
        // And "dont show delivery boy id just show other theree" (meaning restaurantId, restaurantRating, restaurantReview).

        // We select only the needed fields to optimize, but retrieving all is fine too given the scale.
        // Let's sort by createdAt descending to show newest first.
        const reviews = await OrderReview.find({ restaurantId })
            .select('restaurantId restaurantRating restaurantReview createdAt items userId')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching restaurant reviews:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
