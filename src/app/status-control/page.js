"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";



export default function StatusControlPage() {
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(true);
    const [buttonIds, setButtonIds] = useState([1, 2, 3, 4]); // Default to 1-4

    useEffect(() => {
        // Manual Configuration for Button IDs per Restaurant ID
        // You can easily change the numbers in the arrays below to whatever IDs you want for each restaurant.
        const ID_MAPPINGS = {
            1: [1, 2, 3, 4],
            2: [5, 6, 7, 8],
            3: [9, 10, 11, 12],
            4: [13, 14, 15, 16],
            5: [17, 18, 19, 20]
        };

        const restIdStr = localStorage.getItem("restid");
        const restId = restIdStr ? parseInt(restIdStr, 10) : 1;

        // Get the IDs from the map, or default to the first set if not found
        const newButtonIds = ID_MAPPINGS[restId] || [1, 2, 3, 4];

        setButtonIds(newButtonIds);
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

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.title}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Status Control</h1>
            <div className={styles.grid}>
                {buttonIds.map((id) => {
                    const isActive = statuses[id] === true; // Default false if undefined

                    return (
                        <div key={id} className={styles.card}>
                            <span className={styles.label}>ID {id}</span>
                            <div className={styles.buttonGroup}>
                                <button
                                    className={`${styles.button} ${styles.activeBtn} ${isActive ? styles.active : ""
                                        }`}
                                    onClick={() => updateStatus(id, true)}
                                >
                                    Active
                                </button>
                                <button
                                    className={`${styles.button} ${styles.inactiveBtn} ${!isActive ? styles.active : ""
                                        }`}
                                    onClick={() => updateStatus(id, false)}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
