
import { NextResponse } from "next/server";
import { admin, initFirebaseAdmin } from "../../../../lib/firebaseAdmin";
import RestuarentUser from "../../../../models/RegisterUser";
import connectionToDatabase from "../../../../lib/mongoose";

export async function POST(req) {
    try {
        // Ensure Firebase message is initialized
        initFirebaseAdmin();

        await connectionToDatabase();
        const { restaurantId, title, body } = await req.json();

        if (!restaurantId) {
            return NextResponse.json({ success: false, message: "Missing restaurantId" }, { status: 400 });
        }

        // Find the restaurant user with this restId
        const user = await RestuarentUser.findOne({ restId: restaurantId });

        if (!user || !user.fcmToken) {
            console.log(`No FCM token found for restaurant: ${restaurantId}`);
            // Not finding a token isn't strictly/always an error if they just haven't logged in yet, 
            // but we can't send a notification.
            return NextResponse.json({ success: false, message: "No FCM token registered for this restaurant" }, { status: 404 });
        }

        const message = {
            notification: {
                title: title || "New Order Received!",
                body: body || "You have a new order waiting.",
            },
            token: user.fcmToken,
            // Android specific options for high priority to wake up device
            android: {
                priority: 'high',
                notification: {
                    channelId: 'default',
                    priority: 'high',
                    defaultSound: true,
                    defaultVibrateTimings: true
                }
            },
            // Webpush options
            webpush: {
                headers: {
                    Urgency: 'high'
                },
                notification: {
                    icon: '/icons/icon-192x192.png',
                    requireInteraction: true // Keeps notification until user interacts
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);

        return NextResponse.json({ success: true, message: "Notification sent", response });
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ success: false, message: "Error sending notification", error: error.message }, { status: 500 });
    }
}
