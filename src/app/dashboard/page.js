'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Loading from "../loading/page";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

import 'bootstrap/dist/css/bootstrap.min.css';
import './dashboard.css';

export default function Dashboard() {
    const [restId, setRestId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false); // Restaurant Status
    const [statusLoading, setStatusLoading] = useState(false); // Status loading state
    const router = useRouter();

    const [stats, setStats] = useState({
        todayEarnings: 0,
        todayOrders: 0,
        totalEarnings: 0,
        totalOrders: 0
    });
    const [soundEnabled, setSoundEnabled] = useState(false);

    const processStats = useCallback((orders) => {
        const today = new Date().toDateString();
        let todayE = 0;
        let todayO = 0;
        let totalE = 0;
        let totalO = orders.length;

        orders.forEach(order => {
            const amount = parseFloat(order.totalPrice) || 0;
            totalE += amount;

            const orderDate = new Date(order.orderDate).toDateString();
            if (orderDate === today) {
                todayE += amount;
                todayO += 1;
            }
        });

        setStats({
            todayEarnings: todayE * 0.88,
            todayOrders: todayO,
            totalEarnings: totalE * 0.88,
            totalOrders: totalO
        });
    }, []);

    const fetchStats = useCallback(async (restaurantId) => {
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
    }, [processStats]);

    const fetchRestaurantStatus = useCallback(async (restaurantId) => {
        setStatusLoading(true);
        try {
            const res = await axios.get(
                `/api/restaurant-status?restaurantId=${restaurantId}`
            );
            if (res.data.success) {
                setIsActive(res.data.isActive);
            }
        } catch (err) {
            console.error("Status fetch error", err);
        } finally {
            setStatusLoading(false);
        }
    }, []);

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
    }, [router, fetchStats, fetchRestaurantStatus]);

    const toggleStatus = () => {
        updateStatus(!isActive);
    };

    const updateStatus = async (newStatus) => {
        setStatusLoading(true);
        setIsActive(newStatus);

        try {
            await axios.patch("/api/restaurant-status", {
                restaurantId: restId,
                isActive: newStatus,
            });

            // Sync Audio Enabled with Active Status
            if (newStatus) {
                localStorage.setItem("audioEnabled", "true");
                setSoundEnabled(true);
                const audio = new Audio("/noti.mp3");
                audio.play().catch(e => console.log("Audio play failed", e));
            } else {
                localStorage.setItem("audioEnabled", "false");
                setSoundEnabled(false);
            }

        } catch (err) {
            console.error("Error updating status:", err);
            setIsActive(!newStatus);
            alert("Failed to update status");
        } finally {
            setStatusLoading(false);
        }
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
        <div className="dashboard-container container-fluid p-3">

            {/* Header */}
            <div className="header-box" style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '70px' }}>
                <div className="logo-circle"></div>
                <h2 className="logo-text" style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    margin: 0,
                    whiteSpace: 'nowrap'
                }}>LEEVON</h2>
            </div>

            {/* Hero Image */}
            <div className="hero-image-container">
                <div className="hero-image-placeholder"></div>
            </div>

            {/* Swipe Toggle (Performance Click) */}
            <div className="status-toggle-wrapper">
                <div
                    className={`swipe-style-switch ${isActive ? 'active' : 'inactive'}`}
                    onClick={statusLoading ? null : toggleStatus}
                    title={isActive ? "Click to Close" : "Click to Open"}
                >
                    <div className="switch-knob" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {statusLoading && <FaSpinner className="loading-spinner" />}
                    </div>
                    <div className="switch-label">
                        {isActive ? "OPEN" : "CLOSE"}
                    </div>
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
                        <div className="stat-value">
                            <span className="stat-currency">₹</span>
                            {formatCurrency(stats.todayEarnings)}
                        </div>
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
                        <div className="stat-value">
                            <span className="stat-currency">₹</span>
                            {formatCurrency(stats.totalEarnings)}
                        </div>
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
