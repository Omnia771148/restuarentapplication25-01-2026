import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import ButtonStatus from "../../../../models/ButtonStatus";

export async function GET() {
    await connectionToDatabase();
    try {
        const statuses = await ButtonStatus.find({});
        return NextResponse.json({ success: true, data: statuses });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    await connectionToDatabase();
    try {
        const { buttonId, isActive } = await request.json();

        if (buttonId === undefined || isActive === undefined) {
            return NextResponse.json({ success: false, message: "Missing buttonId or isActive" }, { status: 400 });
        }

        const updatedStatus = await ButtonStatus.findOneAndUpdate(
            { buttonId },
            { isActive },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: updatedStatus });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
