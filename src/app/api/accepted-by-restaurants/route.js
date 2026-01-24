import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import AcceptedByRestaurant from "../../../../models/AcceptedByRestaurant";

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

        // Fetch orders from acceptedbyrestorents collection matching the restaurantId
        const orders = await AcceptedByRestaurant.find({ restaurantId }).sort({ orderDate: -1 });

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            userId: order.userId,
            orderDate: order.orderDate,
            totalCount: order.totalCount,
            totalPrice: order.totalPrice,
            grandTotal: order.grandTotal,
            orderId: order.orderId,
            userName: order.userName,
            userEmail: order.userEmail,
            userPhone: order.userPhone,
            deliveryAddress: order.deliveryAddress,
            items: Array.isArray(order.items) ? order.items : [],
            status: order.status
        }));

        return NextResponse.json({ success: true, orders: formattedOrders });
    } catch (err) {
        console.error("❌ Error fetching accepted by restaurants orders:", err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
