'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../loading/page";
import axios from "axios";

import 'bootstrap/dist/css/bootstrap.min.css';
import './dashboard.css';

export default function Dashboard() {
    const [restId, setRestId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false); // Restaurant Status
    const router = useRouter();

    const [stats, setStats] = useState({
        todayEarnings: 0,
        todayOrders: 0,
        totalEarnings: 0,
        totalOrders: 0
    });
    const [soundEnabled, setSoundEnabled] = useState(false);

    useEffect(() => {
        const storedRestId = localStorage.getItem("restid");
        const loginTime = localStorage.getItem("loginTime");
        const isAudioEnabled = localStorage.getItem("audioEnabled") === "true";
        setSoundEnabled(isAudioEnabled);

        if (!storedRestId || !loginTime) {
            router.push("/");
            return;
        }

        setRestId(storedRestId);
        fetchStats(storedRestId);
        fetchRestaurantStatus(storedRestId);
        setLoading(false);
    }, [router]);

    const fetchStats = async (restaurantId) => {
        try {
            const res = await fetch(`/api/accepted-by-restaurants?restaurantId=${restaurantId}`);
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();

            if (data.success) {
                processStats(data.orders);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchRestaurantStatus = async (restaurantId) => {
        try {
            const res = await axios.get(
                `/api/restaurant-status?restaurantId=${restaurantId}`
            );
            if (res.data.success) {
                setIsActive(res.data.isActive);
            }
        } catch (err) {
            console.error("Status fetch error", err);
        }
    };

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        localStorage.setItem("audioEnabled", String(newState));
        if (newState) {
            const audio = new Audio("/noti.mp3");
            audio.play().catch(() => { });
        }
    };

    const [dragX, setDragX] = useState(null); // null means not dragging
    const [startX, setStartX] = useState(0);
    const [startDragX, setStartDragX] = useState(0); // where the knob was when drag started

    // ... existing stats fetch ...

    const handleToggleClick = () => {
        // Fallback for click if no drag occurred
        if (dragX === null) updateStatus(!isActive);
    };

    const updateStatus = async (newStatus) => {
        setIsActive(newStatus);
        setDragX(null); // Reset drag

        // Sync Audio Enabled with Active Status
        if (newStatus) {
            localStorage.setItem("audioEnabled", "true");
            // Play confirmation sound
            const audio = new Audio("/noti.mp3");
            audio.play().catch(e => console.log("Audio play failed", e));
        } else {
            localStorage.setItem("audioEnabled", "false");
        }

        try {
            await axios.patch("/api/restaurant-status", {
                restaurantId: restId,
                isActive: newStatus,
            });
        } catch (err) {
            console.error("Error updating status:", err);
            setIsActive(!newStatus);
            alert("Failed to update status");
        }
    };

    // --- Swipe Handlers ---
    const handleStart = (clientX) => {
        setStartX(clientX);
        // If active, we start at 230px, else 0px
        setStartDragX(isActive ? 230 : 0);
        setDragX(isActive ? 230 : 0); // Initialize drag position
    };

    const handleMove = (clientX) => {
        if (dragX === null) return;
        const delta = clientX - startX;
        let newX = startDragX + delta;

        // Clamp between 0 and 230
        newX = Math.max(0, Math.min(230, newX));
        setDragX(newX);
    };

    const handleEnd = () => {
        if (dragX === null) return;

        // Threshold to toggle (e.g., dragged past midpoint of 115px)
        const midpoint = 115;
        const shouldBeActive = dragX > midpoint;

        if (shouldBeActive !== isActive) {
            updateStatus(shouldBeActive);
        } else {
            // Snap back
            setDragX(null);
        }
    };

    // Touch events
    const onTouchStart = (e) => handleStart(e.touches[0].clientX);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    // Mouse events (for desktop testing)
    const onMouseDown = (e) => handleStart(e.clientX);
    const onMouseMove = (e) => {
        if (dragX !== null) handleMove(e.clientX);
    };
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => handleEnd();

    // ... (rest of render logic remains, replace just the toggle-switch jsx)

    const processStats = (orders) => {
        const today = new Date().toDateString();
        let todayE = 0;
        let todayO = 0;
        let totalE = 0;
        let totalO = orders.length;

        orders.forEach(order => {
            const amount = parseFloat(order.grandTotal) || 0;
            totalE += amount;

            const orderDate = new Date(order.orderDate).toDateString();
            if (orderDate === today) {
                todayE += amount;
                todayO += 1;
            }
        });

        setStats({
            todayEarnings: todayE,
            todayOrders: todayO,
            totalEarnings: totalE,
            totalOrders: totalO
        });
    };

    const navigateToMenu = () => {
        router.push("/status-control");
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-IN');
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="dashboard-container container-fluid p-3"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        >
            {/* Header */}
            <div className="header-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="logo-circle"></div>
                    <h2 className="logo-text">SPV</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={toggleSound}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                        title={soundEnabled ? "Mute Sound" : "Enable Sound"}
                    >
                        {soundEnabled ? "🔊" : "🔇"}
                    </button>
                    <div className="text-end">
                        <small>Thank for choosing our<br />service</small>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div className="hero-image-container">
                <div className="hero-image-placeholder"></div>
            </div>

            {/* Swipe Handle / Toggle */}
            <div className="restaurant-status-toggle">
                <div className="swipe-text">
                    {isActive ? "Swipe left to close" : "Swipe right to open"}
                </div>

                <div
                    className={`toggle-switch ${isActive ? 'active' : ''}`}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseDown={onMouseDown}
                // No onClick here, logic is in handleEnd
                >
                    <div
                        className="toggle-knob"
                        style={
                            dragX !== null
                                ? { transform: `translateX(${dragX}px)`, transition: 'none' }
                                : {}
                        }
                    >
                        {isActive ? "On" : "Off"}
                    </div>
                </div>

                <div className="swipe-text text-center mt-1">
                    {/* Visual cue text for bottom if needed */}
                </div>
            </div>

            {/* My Menu Button */}
            <div className="text-center">
                <button className="my-menu-btn" onClick={navigateToMenu}>
                    MY<br />MENU
                </button>
            </div>

            <div className="row g-3 stats-container">
                <div className="col-6">
                    <div className="stat-card">
                        <div className="stat-title">Today earnings</div>
                        <div className="stat-value">Rs-{formatCurrency(stats.todayEarnings)}</div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="stat-card">
                        <div className="stat-title">Today orders</div>
                        <div className="stat-value">{stats.todayOrders}</div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="stat-card">
                        <div className="stat-title">Total earnings</div>
                        <div className="stat-value">Rs-{formatCurrency(stats.totalEarnings)}</div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="stat-card">
                        <div className="stat-title">Total orders</div>
                        <div className="stat-value">{stats.totalOrders}</div>
                    </div>
                </div>
            </div>


        </div>
    );
}
