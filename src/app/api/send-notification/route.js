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

        // Find the restaurant user with this restId
        const user = await RestuarentUser.findOne({ restId: restaurantId });

        if (!user) {
            return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
        }

        const tokens = [];
        if (user.fcmToken) tokens.push({ token: user.fcmToken, type: 'web' });
        if (user.mobileFcmToken) tokens.push({ token: user.mobileFcmToken, type: 'mobile' });

        if (tokens.length === 0) {
            console.log(`No FCM Token found for restaurant: ${restaurantId}`);
            return NextResponse.json({ success: false, message: "No FCM Token registered for this restaurant" }, { status: 404 });
        }

        const admin = initFirebaseAdmin();
        const results = await Promise.all(tokens.map(async ({ token, type }) => {
            const message = {
                token: token,
                notification: {
                    title: title || "New Order Received!",
                    body: body || "You have a new order waiting."
                },
                data: {
                    url: 'https://restuarentapplication25-01-2026.vercel.app/orders', // Full URL for RN app to open
                    click_action: '/orders' // For Web legacy
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK', // Often used defaults, but RN handles data payload usually
                        channelId: 'default',
                    },
                },
                webpush: {
                    headers: {
                        Urgency: "high"
                    },
                    notification: {
                        icon: '/icons/icon-192x192.png',
                        requireInteraction: true
                    },
                    fcmOptions: {
                        link: '/orders'
                    }
                }
            };

            try {
                await admin.messaging().send(message);
                return { success: true, token };
            } catch (error) {
                console.error(`Error sending to ${type} token:`, error);
                if (error.code === 'messaging/registration-token-not-registered') {
                    const updateQuery = type === 'web' ? { $unset: { fcmToken: "" } } : { $unset: { mobileFcmToken: "" } };
                    await RestuarentUser.updateOne({ restId: restaurantId }, updateQuery);
                }
                return { success: false, error: error.message };
            }
        }));

        const successCount = results.filter(r => r.success).length;
        console.log(`Sent notifications to ${successCount} devices for restaurant ${restaurantId}`);

        return NextResponse.json({
            success: true,
            message: `FCM Notification sent to ${successCount} devices`,
            details: results
        });

    } catch (error) {
        console.error("Error in notification endpoint:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
