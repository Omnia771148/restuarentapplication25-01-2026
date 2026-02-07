import { NextResponse } from "next/server";
import RestuarentUser from "../../../../models/RegisterUser";
import connectionToDatabase from "../../../../lib/mongoose";
import { initFirebaseAdmin } from "../../../../lib/firebaseAdmin";

export async function POST(req) {
    try {
        await connectionToDatabase();
        const { restaurantId, title, body } = await req.json();

        if (!restaurantId) {
            return NextResponse.json({ success: false, message: "Missing restaurantId" }, { status: 400 });
        }

        console.log(`📡 NOTIFICATION REQUEST: Attempting to notify Restaurant ${restaurantId}`);

        // Robust find: try string and then number
        let user = await RestuarentUser.findOne({ restId: String(restaurantId) });
        if (!user) {
            user = await RestuarentUser.findOne({ restId: Number(restaurantId) });
        }

        if (!user) {
            console.error(`❌ NOTIFICATION FAILED: Restaurant ${restaurantId} not found in DB.`);
            return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
        }

        const tokens = [];
        if (user.fcmToken) tokens.push({ token: user.fcmToken, type: 'web' });
        if (user.mobileFcmToken) tokens.push({ token: user.mobileFcmToken, type: 'mobile' });

        if (tokens.length === 0) {
            console.log(`⚠️ No FCM Tokens (Web or Mobile) found for restaurant: ${restaurantId}`);
            return NextResponse.json({ success: false, message: "No registered devices found for this restaurant" }, { status: 404 });
        }

        const admin = initFirebaseAdmin();
        const results = await Promise.all(tokens.map(async ({ token, type }) => {
            const message = {
                token: token,
                notification: {
                    title: title || "New Order Received! 🍔",
                    body: body || "You have a new order waiting. Open the app to view details."
                },
                data: {
                    url: 'https://restuarentapplication25-01-2026.vercel.app/orders',
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'default',
                        priority: 'high',
                    },
                },
                webpush: {
                    headers: { Urgency: "high" },
                    notification: {
                        icon: '/icons/icon-192x192.png',
                        requireInteraction: true
                    }
                }
            };

            try {
                const response = await admin.messaging().send(message);
                console.log(`✅ ${type.toUpperCase()} Notification Sent:`, response);
                return { success: true, type, response };
            } catch (error) {
                console.error(`❌ ${type.toUpperCase()} Send Error:`, error.message);
                // If token is invalid, clean it up
                if (error.code === 'messaging/registration-token-not-registered' || error.message.includes('not-registered')) {
                    console.log(`🧹 Cleaning up expired ${type} token...`);
                    const updateQuery = type === 'web' ? { $unset: { fcmToken: "" } } : { $unset: { mobileFcmToken: "" } };
                    await RestuarentUser.updateOne({ _id: user._id }, updateQuery);
                }
                return { success: false, type, error: error.message };
            }
        }));

        const successCount = results.filter(r => r.success).length;
        return NextResponse.json({
            success: true,
            message: `Sent to ${successCount} of ${tokens.length} devices`,
            results
        });

    } catch (error) {
        console.error("🔥 INTERNAL ERROR in send-notification:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
