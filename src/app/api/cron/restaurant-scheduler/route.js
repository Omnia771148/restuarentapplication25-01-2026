import { NextResponse } from 'next/server';
import connectionToDatabase from '../../../../lib/mongoose';
import RestaurantStatus from '../../../../models/RestaurantStatus';

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

export async function GET(request) {
    try {
        // 1. Connect to Database
        await connectionToDatabase();

        // 2. Security Check (Optional: Add CRON_SECRET to your .env variables in Vercel)
        // const authHeader = request.headers.get('authorization');
        // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return new NextResponse('Unauthorized', { status: 401 });
        // }

        // 3. Get Action from URL Query
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action'); // Expected: 'open' or 'close'

        if (!action) {
            return NextResponse.json({ success: false, message: 'Action parameter is required (open/close)' }, { status: 400 });
        }

        let isActive;
        if (action === 'open') {
            isActive = true;
        } else if (action === 'close') {
            isActive = false;
        } else {
            return NextResponse.json({ success: false, message: 'Invalid action. Use "open" or "close"' }, { status: 400 });
        }

        // 4. Update Status for ALL Restaurants
        // The user wants a global schedule: "restaurants will be open..."
        // This updates the status for every restaurant record found in the database.
        const result = await RestaurantStatus.updateMany({}, { isActive });

        console.log(`Cron Job Executed: Restaurants set to ${isActive ? 'OPEN' : 'CLOSED'}. Modified ${result.modifiedCount} records.`);

        return NextResponse.json({
            success: true,
            message: `Successfully set all restaurants to ${isActive ? 'OPEN' : 'CLOSED'}`,
            details: {
                action,
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
