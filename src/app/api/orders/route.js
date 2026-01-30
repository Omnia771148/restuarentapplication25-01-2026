import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";

export async function GET(request) {
  await connectionToDatabase();

  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ success: false, message: "Restaurant ID is required" }, { status: 400 });
    }

    const orders = await Order.find({ restaurantId }).sort({ orderDate: -1 });

    // Always send items as array
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      userId: order.userId,
      orderDate: order.orderDate,
      totalCount: order.totalCount,
      totalPrice: order.totalPrice,
      orderId: order.orderId,
      restaurantId: order.restaurantId,


      items: Array.isArray(order.items) ? order.items : []
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
