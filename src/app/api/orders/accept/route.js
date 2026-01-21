import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../../lib/mongoose";
import Order from "../../../../../models/Order";
import AcceptedOrder from "../../../../../models/AcceptedOrder";

// ✅ NEW: lightweight model for orderstatuses
const OrderStatus =
  mongoose.models.OrderStatus ||
  mongoose.model(
    "OrderStatus",
    new mongoose.Schema({}, { strict: false }), // allow any fields
    "orderstatuses" // force collection name
  );

export async function POST(request) {
  await connectionToDatabase();

  try {
    // 1. Get mongoId, rest location, AND razorpayOrderId from frontend
    const { orderId: mongoId, rest, razorpayOrderId } = await request.json();

    if (!mongoId) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    // 2. Find the order in the pending collection
    // Ensure User model is registered for populate to work
    if (!mongoose.models.User) {
      mongoose.model("User", new mongoose.Schema({}, { strict: false }));
    }

    // Populate userId to get customer details
    const order = await Order.findById(mongoId).populate("userId");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const orderData = order.toObject();

    // Extract user details safely
    let userDetails = {
      userName: "Unknown",
      userEmail: "Unknown",
      userPhone: "Unknown"
    };

    if (order.userId && typeof order.userId === 'object') {
      const u = order.userId;
      userDetails = {
        userName: u.name || u.userName || "Unknown",
        userEmail: u.email || "Unknown",
        userPhone: u.phone || u.phoneNumber || u.mobile || "Unknown"
      };
      // Restore userId to ID string for the AcceptedOrder record
      orderData.userId = u._id;
    }

    // 3. Prepare the new entry
    const newEntryData = {
      ...orderData,
      ...userDetails,
      rest: rest,
      razorpayOrderId: razorpayOrderId || orderData.razorpayOrderId,
    };

    // 4. Remove the old database _id so a new unique one is created
    delete newEntryData._id;
    delete newEntryData.__v;

    // 5. ✅ Upsert into Accepted collection (avoids duplicate key error)
    await AcceptedOrder.updateOne(
      { orderId: orderData.orderId }, // match by orderId
      { $set: newEntryData },
      { upsert: true }
    );

    // 6. Delete from old collection
    await Order.findByIdAndDelete(mongoId);

    // 7. Update status in orderstatuses collection
    const result = await OrderStatus.updateOne(
      { orderId: orderData.orderId, status: "Pending" },
      { $set: { status: "Waiting for delivery boy to accept" } }
    );

    console.log("OrderStatus update result:", result);

    return NextResponse.json({
      success: true,
      message: "Order accepted and status updated",
    });
  } catch (err) {
    console.error("❌ Accept order error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}