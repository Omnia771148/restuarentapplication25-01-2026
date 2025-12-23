import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import RestaurantStatus from "../../../../models/RestaurantStatus";

export async function GET(req) {
  await connectionToDatabase();

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json({ success: false });
  }

  let status = await RestaurantStatus.findOne({ restaurantId });

  if (!status) {
    status = await RestaurantStatus.create({ restaurantId });
  }

  return NextResponse.json({ success: true, isActive: status.isActive });
}

export async function PATCH(req) {
  await connectionToDatabase();
  const { restaurantId, isActive } = await req.json();

  const updated = await RestaurantStatus.findOneAndUpdate(
    { restaurantId },
    { isActive },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, isActive: updated.isActive });
}
