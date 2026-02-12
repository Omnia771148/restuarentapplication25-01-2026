"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "../loading/page";
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSyncAlt, FaExclamationCircle } from "react-icons/fa";
import "../orders/orders.css"; // Reuse themed CSS

// --- Sub-Component: Profile Card ---
const ProfileCard = ({ user }) => {
    if (!user) return null;

    return (
        <div className="order-card p-4">
            <div className="text-center mb-4">
                <h2 className="mt-2" style={{ fontWeight: '800' }}>Restaurant Profile</h2>
            </div>

            <div className="divider-line"></div>

            {/* Email */}
            <div className="d-flex align-items-center mb-4">
                <div className="me-3" style={styles.iconContainer}>
                    <FaEnvelope />
                </div>
                <div>
                    <div style={styles.label}>Email Address</div>
                    <div style={styles.value}>{user.email}</div>
                </div>
            </div>

            {/* Phone */}
            <div className="d-flex align-items-center mb-4">
                <div className="me-3" style={{ ...styles.iconContainer, transform: 'rotate(90deg)' }}>
                    <FaPhone />
                </div>
                <div>
                    <div style={styles.label}>Phone Number</div>
                    <div style={styles.value}>{user.phone}</div>
                </div>
            </div>

            {/* Latitude */}
            <div className="d-flex align-items-center mb-4">
                <div className="me-3" style={styles.iconContainer}>
                    <FaMapMarkerAlt />
                </div>
                <div>
                    <div style={styles.label}>Latitude</div>
                    <div style={styles.value}>{user.restaurantLocation?.lat}</div>
                </div>
            </div>

            {/* Longitude */}
            <div className="d-flex align-items-center mb-4">
                <div className="me-3" style={styles.iconContainer}>
                    <FaMapMarkerAlt />
                </div>
                <div>
                    <div style={styles.label}>Longitude</div>
                    <div style={styles.value}>{user.restaurantLocation?.lng}</div>
                </div>
            </div>

            <div className="divider-line"></div>

            {/* Location Button */}
            <div className="mt-4">
                <div style={{ ...styles.label, textAlign: 'center', marginBottom: '15px' }}>Location</div>
                <a
                    href={user.restLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-100 d-flex align-items-center justify-content-center hover-scale"
                    style={styles.locationBtn}
                >
                    <FaMapMarkerAlt className="me-2" /> Open In Google Maps
                </a>
            </div>
        </div>
    );
};

export default function MyProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check for restaurant ID safely for client-side
            const restId = typeof window !== 'undefined' ? localStorage.getItem("restid") : null;

            if (!restId) {
                router.push("/");
                return;
            }

            const res = await axios.get(`/api/profile?restId=${restId}`);
            if (res.data.success) {
                setUser(res.data.user);
            } else {
                throw new Error("Failed to load profile data");
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError(err.message || "Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className="container-fluid p-5 text-center">
                <div className="d-flex flex-column align-items-center justify-content-center">
                    <FaExclamationCircle className="text-danger mb-3" size={50} />
                    <h4 className="text-danger mb-3">Error Loading Profile</h4>
                    <p className="text-muted mb-4">{error}</p>
                    <button onClick={fetchProfile} className="btn btn-dark rounded-pill px-4 py-2">
                        <FaSyncAlt className="me-2" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-3 pb-5" style={styles.pageContainer}>
            {/* Header */}
            <div className="d-flex justify-content-center align-items-center mb-4">
                <div className="page-header">
                    <FaUserCircle className="header-icon" />
                    <span>My Profile</span>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    {user ? (
                        <ProfileCard user={user} />
                    ) : (
                        <div className="text-center mt-5 text-muted">
                            <h4>Profile not found</h4>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageContainer: {
        backgroundColor: '#fcfbf7',
        minHeight: '100vh'
    },
    iconContainer: {
        fontSize: '1.5rem',
        color: '#666'
    },
    label: {
        fontSize: '0.85rem',
        color: '#888',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    value: {
        fontSize: '1.2rem',
        fontWeight: '600'
    },
    locationBtn: {
        backgroundColor: '#e6e0d0',
        color: '#000',
        borderRadius: '50px',
        padding: '15px',
        fontWeight: '800',
        fontSize: '1.1rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        border: 'none'
    },
    refreshBtn: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};
