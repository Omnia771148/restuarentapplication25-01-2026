"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Data } from "../data/page";
import Loading from "../loading/page";
import { FaClipboardList } from "react-icons/fa";


export default function StatusControlPage() {
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(true);

    const [restaurantItems, setRestaurantItems] = useState([]); // Store full items
    const [searchTerm, setSearchTerm] = useState(""); // Search term state


    useEffect(() => {
        const restIdStr = localStorage.getItem("restid");
        const restId = restIdStr ? parseInt(restIdStr, 10) : 1;

        // Filter Data for the specific restaurant
        const items = Data.filter(item => item.restid === restId);
        setRestaurantItems(items);

        fetchStatuses();
    }, []);
    const fetchStatuses = async () => {
        try {
            const res = await fetch("/api/button-status");
            const data = await res.json();
            if (data.success) {
                // Convert array to object for easier access
                const statusMap = {};
                data.data.forEach((item) => {
                    statusMap[item.buttonId] = item.isActive;
                });
                setStatuses(statusMap);
            }
        } catch (error) {
            console.error("Failed to fetch statuses", error);
        } finally {
            setLoading(false);
        }
    };
    const updateStatus = async (id, isActive) => {
        // Optimistic update
        setStatuses((prev) => ({
            ...prev,
            [id]: isActive,
        }));
        try {
            await fetch("/api/button-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ buttonId: id, isActive }),
            });
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on error could be implemented here
        }
    };
    const activateAll = async () => {
        const allActive = {};
        restaurantItems.forEach(item => {
            allActive[item.id] = true;
        });
        setStatuses(prev => ({ ...prev, ...allActive }));
        for (const item of restaurantItems) {
            try {
                fetch("/api/button-status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ buttonId: item.id, isActive: true }),
                });
            } catch (error) {
                console.error(`Failed to activate ID ${item.id}`, error);
            }
        }
    };
    const deactivateAll = async () => {
        const allInactive = {};
        restaurantItems.forEach(item => {
            allInactive[item.id] = false;
        });
        setStatuses(prev => ({ ...prev, ...allInactive }));
        for (const item of restaurantItems) {
            try {
                fetch("/api/button-status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ buttonId: item.id, isActive: false }),
                });
            } catch (error) {
                console.error(`Failed to deactivate ID ${item.id}`, error);
            }
        }
    };
    if (loading) {
        return <Loading />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.titleWrapper}>
                <div className={styles.title}>
                    <FaClipboardList className={styles.headerIcon} />
                    <span>My Menu</span>
                </div>
            </div>


            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search for items..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>


            {/* New Buttons to Activate/Deactivate All */}
            <div className={styles.bulkActions}>
                <button
                    className={styles.activateAllBtn}
                    onClick={activateAll}
                >
                    Activate All
                </button>
                <button
                    className={styles.deactivateAllBtn}
                    onClick={deactivateAll}
                >
                    Deactivate All
                </button>
            </div>
            <div className={styles.grid}>
                {restaurantItems.filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((item) => {
                    const isActive = statuses[item.id] === true; // Default false if undefined
                    return (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.itemDetails}>
                                <div className={styles.itemName}>{item.name}</div>
                                <div className={styles.itemMeta}>
                                    <span className={styles.price}>₹{item.price}</span>
                                    <span>•</span>
                                    {item.type === "veg" ? (
                                        <span className={styles.veg}>🟢 Veg</span>
                                    ) : (
                                        <span className={styles.nonVeg}>🔺 Non-Veg</span>
                                    )}
                                </div>
                            </div>
                            <div
                                className={styles.customToggle}
                                onClick={() => updateStatus(item.id, !isActive)}
                            >
                                {/* Static Labels on the container background */}
                                {!isActive && <span className={styles.staticLabelLeft}>Active</span>}
                                {isActive && <span className={styles.staticLabelRight}>Inactive</span>}

                                {/* The Sliding Part */}
                                <div className={`${styles.toggleSlider} ${isActive ? styles.active : styles.inactive}`}>
                                    {isActive ? (
                                        <>
                                            <span className={styles.toggleStatusText}>Active</span>
                                            <div className={styles.toggleKnob}></div>
                                        </>

                                    ) : (
                                        <>
                                            <div className={styles.toggleKnob}></div>
                                            <span className={styles.toggleStatusText}>Inactive</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}