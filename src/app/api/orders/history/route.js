import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/mongoose";
import AcceptedOrder from "../../../../../models/AcceptedOrder";
import RejectedOrder from "../../../../../models/RejectedOrder";

export async function GET(req) {
  try {
    await connectionToDatabase();

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        message: "No restaurantId"
      });
    }

    // ✅ Dynamic today in IST
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    // Format: YYYY-MM-DD

    // ✅ Accepted Orders (today only)
    const acceptedOrders = await AcceptedOrder.aggregate([
      { $match: { restaurantId } },
      {
        $addFields: {
          orderDay: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orderDate",
              timezone: "Asia/Kolkata"
            }
          }
        }
      },
      { $match: { orderDay: today } }
    ]);

    // ✅ Rejected Orders (today only)
    const rejectedOrders = await RejectedOrder.aggregate([
      { $match: { restaurantId } },
      {
        $addFields: {
          orderDay: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orderDate",
              timezone: "Asia/Kolkata"
            }
          }
        }
      },
      { $match: { orderDay: today } }
    ]);

    // Add orderStatus
    const accepted = acceptedOrders.map(order => ({
      ...order,
      orderStatus: "accepted"
    }));

    const rejected = rejectedOrders.map(order => ({
      ...order,
      orderStatus: "rejected"
    }));

    // Merge and sort by orderDate
    const allOrders = [...accepted, ...rejected].sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
    );

    return NextResponse.json({
      success: true,
      orders: allOrders
    });

  } catch (err) {
    console.error("Order history error:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
