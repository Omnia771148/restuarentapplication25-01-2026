"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

export default function GlobalSoundManager() {
    const prevOrdersRef = useRef([]);
    // Track if this is the very first load of the component to avoid sound on refresh
    const isFirstLoad = useRef(true);

    useEffect(() => {
        // Basic guard for SSR
        if (typeof window === "undefined") return;

        console.log("GlobalSoundManager: Initialized");

        const checkOrdersAndPlaySound = async () => {
            const restaurantId = localStorage.getItem("restid");
            const audioEnabled = localStorage.getItem("audioEnabled") === "true";

            // Debug current state
            // console.log(`GlobalSoundManager Tick: RestID=${restaurantId}, Audio=${audioEnabled}`);

            if (!restaurantId) return;

            try {
                // 1. Check if restaurant is ACTIVE
                const statusRes = await axios.get(
                    `/api/restaurant-status?restaurantId=${restaurantId}`
                );

                // Default to true if api fails or implies active, but following previous logic:
                // Use loose check in case of null/undefined
                const isActive = statusRes.data?.success ? statusRes.data.isActive : false;

                if (!isActive) {
                    // console.log("Restaurant is inactive, skipping order check.");
                    return;
                }

                // 2. Fetch Orders
                const ordersRes = await axios.get(
                    `/api/orders?restaurantId=${restaurantId}`
                );

                if (ordersRes.data.success) {
                    const newOrders = ordersRes.data.orders || [];

                    // Get IDs
                    const prevIds = prevOrdersRef.current.map((o) => o._id);
                    const newIds = newOrders.map((o) => o._id);

                    // Check for ANY new order ID that wasn't in our previous list
                    const hasNewOrder = newIds.some((id) => !prevIds.includes(id));

                    if (hasNewOrder) {
                        console.log("GlobalSoundManager: New order detected!");

                        // Only play sound if enabled AND not the first load (to avoid noise on refresh)
                        if (audioEnabled && !isFirstLoad.current) {
                            console.log("GlobalSoundManager: Playing Sound 🔔");
                            const audio = new Audio("/noti.mp3");
                            audio.play().catch((e) => console.error("Audio play failed:", e));
                        } else if (isFirstLoad.current) {
                            console.log("GlobalSoundManager: Skipping sound on first load.");
                        } else {
                            console.log("GlobalSoundManager: Sound disabled by user.");
                        }
                    }

                    // Update reference
                    prevOrdersRef.current = newOrders;
                }
            } catch (err) {
                console.error("GlobalSoundManager Error:", err);
            } finally {
                // After the first check completes, we are no longer in "first load" state
                isFirstLoad.current = false;
            }
        };

        // Run immediately on mount
        checkOrdersAndPlaySound();

        // Poll every 3 seconds
        const interval = setInterval(checkOrdersAndPlaySound, 3000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
