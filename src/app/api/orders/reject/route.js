import { NextResponse } from "next/server";
import mongoose from "mongoose"; // ✅ NEW (only addition)
import connectionToDatabase from "../../../../../lib/mongoose";
import Order from "../../../../../models/Order";
import RejectedOrder from "../../../../../models/RejectedOrder";

export async function POST(req) {
  try {
    await connectionToDatabase();

    const { orderId } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({
        success: false,
        message: "Order not found"
      });
    }

    // Save exact same structure (UNCHANGED)
    await RejectedOrder.create({
      userId: order.userId,
      items: order.items,
      totalCount: order.totalCount,
      totalPrice: order.totalPrice,
      restaurantId: order.restaurantId,
      orderDate: order.orderDate,
      rest: order.rest,
      orderId: order.orderId,
      status: "rejected"
    });

    // Remove from active orders (UNCHANGED)
    await Order.findByIdAndDelete(orderId);

    // ✅ NEW: Update OrderStatus collection
    await mongoose.connection.collection("orderstatuses").updateOne(
      { orderId: order.orderId },
      {
        $set: {
          status: "Rejected by restaurant"
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reject order error:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
