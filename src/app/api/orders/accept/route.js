import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../../lib/mongoose";
import Order from "../../../../../models/Order";
import AcceptedOrder from "../../../../../models/AcceptedOrder";
import AcceptedByRestaurant from "../../../../../models/AcceptedByRestaurant";

// ✅ NEW: lightweight model for orderstatuses
const OrderStatus =
  mongoose.models.OrderStatus ||
  mongoose.model(
    "OrderStatus",
    new mongoose.Schema({}, { strict: false }), // allow any fields
    "orderstatuses" // force collection name
  );

// ✅ NEW: lightweight model for pendingpayments
const PendingPayment =
  mongoose.models.PendingPayment ||
  mongoose.model(
    "PendingPayment",
    new mongoose.Schema({
      restaurantId: { type: String, required: true },
      restaurantName: String,
      grandTotal: { type: Number, default: 0 },
      date: { type: Date, default: Date.now }
    }),
    "pendingpayments"
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

    // 5b. ✅ Upsert into AcceptedByRestaurant collection
    await AcceptedByRestaurant.updateOne(
      { orderId: orderData.orderId }, // match by orderId
      { $set: newEntryData },
      { upsert: true }
    );

    // 5c. ✅ Record/Update Pending Payment for Restaurant
    await PendingPayment.updateOne(
      { restaurantId: orderData.restaurantId },
      {
        $inc: { grandTotal: orderData.totalPrice },
        $set: {
          restaurantName: orderData.restaurantName,
          date: new Date()
        }
      },
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

    // 🚀 NEW: Trigger Notification to All Delivery Boys
    try {
      console.log("🔔 Triggering delivery notifications...");
      // Using fire-and-forget approach (not awaiting perfectly to avoid blocking response)
      fetch('https://deliverymanmain.vercel.app/api/deliveryboy/broadcast-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "New Order Available! 🛵",
          body: `Order #${orderData.orderId} is ready for pickup in ${rest || 'your area'}`
        })
      }).then(res => res.json()).then(d => console.log("Notification Sent:", d)).catch(e => console.error("Notif Failed:", e));
    } catch (e) {
      console.error("Notification Trigger Error:", e);
    }

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