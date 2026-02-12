import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import RestuarentUser from "../../../../models/RegisterUser";

export async function POST(req) {
  try {
    await connectionToDatabase();

    const {
      email,
      phone,
      password,
      restId,
      restLocation,
      latitude,
      longitude,
    } = await req.json();

    // validation
    if (
      !email ||
      !phone ||
      !password ||
      !restId ||
      !restLocation ||
      !latitude ||
      !longitude
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const exists = await RestuarentUser.findOne({
      $or: [{ email }, { phone }],
    });

    if (exists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    await RestuarentUser.create({
      email,
      phone,
      password,
      restId,
      restLocation,
      restaurantLocation: {
        lat: Number(latitude),
        lng: Number(longitude),
      },
    });

    return NextResponse.json(
      { message: "Restaurant user created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
