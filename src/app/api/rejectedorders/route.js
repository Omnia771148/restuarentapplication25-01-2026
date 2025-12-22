// app/api/orders/rejected/route.js
import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import RejectedOrder from "../../../../models/RejectedOrder";

export async function GET(req) {
  try {
    await connectionToDatabase();

    const rejectedOrders = await RejectedOrder.find().sort({ orderDate: -1 }); // latest first

    return NextResponse.json({ success: true, orders: rejectedOrders });
  } catch (err) {
    console.error("Fetch rejected orders error:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
