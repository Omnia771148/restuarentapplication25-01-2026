import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import AcceptedOrder from "../../../../models/AcceptedOrder";

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

    // Fetch accepted orders strictly matching this restaurantId
    const orders = await AcceptedOrder.find({ restaurantId }).sort({ acceptedAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      userId: order.userId,
      orderDate: order.orderDate,
      acceptedAt: order.acceptedAt,
      totalCount: order.totalCount,
      totalPrice: order.totalPrice,
      orderId: order.orderId,
      items: Array.isArray(order.items) ? order.items : []
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error("❌ Error fetching accepted orders:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
