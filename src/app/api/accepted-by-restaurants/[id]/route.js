import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/mongoose";
import AcceptedByRestaurant from "../../../../../models/AcceptedByRestaurant";
import RestuarentUser from "../../../../../models/RegisterUser";

export async function GET(request, context) {
    await connectionToDatabase();

    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }

        const order = await AcceptedByRestaurant.findById(id);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // Fetch restaurant email
        const restaurantUser = await RestuarentUser.findOne({ restId: order.restaurantId });
        const restaurantEmail = restaurantUser ? restaurantUser.email : null;
        const fssai = restaurantUser ? restaurantUser.fssai : null;
        const address = restaurantUser ? restaurantUser.address : null;

        return NextResponse.json({
            success: true,
            order: {
                ...order.toObject(),
                restaurantEmail,
                fssai,
                address
            },
        });
    } catch (err) {
        console.error("❌ Error fetching accepted by restaurant order:", err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
