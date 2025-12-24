import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/mongoose";
import Order from "../../../../../models/Order";
import AcceptedOrder from "../../../../../models/AcceptedOrder";

export async function POST(request) {
  await connectionToDatabase();

  try {
    // 1. Get mongoId, rest location, AND razorpayOrderId from frontend
    const { orderId: mongoId, rest, razorpayOrderId } = await request.json();

    if (!mongoId) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    // 2. Find the order in the pending collection
    const order = await Order.findById(mongoId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const orderData = order.toObject();

    // 3. Prepare the new entry
    const newEntryData = {
      ...orderData,       // Copies existing data (items, price, etc.)
      rest: rest,         // Adds restaurant location
      // Ensure razorpayOrderId is included. 
      // We take it from the request if sent, otherwise fallback to what's in the DB.
      razorpayOrderId: razorpayOrderId || orderData.razorpayOrderId 
    };

    // 4. Remove the old database _id so a new unique one is created for the Accepted collection
    delete newEntryData._id;
    delete newEntryData.__v;

    // 5. Create in Accepted collection
    await AcceptedOrder.create(newEntryData);

    // 6. Delete from old collection
    await Order.findByIdAndDelete(mongoId);

    return NextResponse.json({ success: true, message: "Order accepted and moved" });
  } catch (err) {
    console.error("❌ Accept order error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}