"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaCog, FaStar, FaEnvelope, FaChevronRight, FaRegUser, FaBoxOpen, FaSignOutAlt, FaPhoneAlt } from "react-icons/fa";
import "./settings.css";

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();

    const fetchProfile = useCallback(async () => {
        try {
            const restId = typeof window !== 'undefined' ? localStorage.getItem("restid") : null;
            if (!restId) {
                router.push("/");
                return;
            }

            const res = await axios.get(`/api/profile?restId=${restId}`);
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        const id = localStorage.getItem("restid");
        if (id) localStorage.removeItem(`mobileConnected_${id}`);

        localStorage.removeItem("restid");
        localStorage.removeItem("restlocation");
        localStorage.removeItem("loginTime");
        router.push("/");
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <div className="settings-container">

            {/* Page Title */}
            {!loading && (
                <div className="page-title-pill">
                    <FaCog className="settings-icon-spin" />
                    <span>Settings</span>
                </div>
            )}

            {/* Profile Detail Card */}
            {user && (
                <div className="profile-detail-card">
                    <div className="profile-initial-circle">
                        {user.email ? user.email.charAt(0).toUpperCase() : "L"}
                    </div>
                    <div className="profile-info-group">
                        <h2 className="profile-name-text">{user.email || "LEEVON"}</h2>
                        <div className="profile-phone-row">
                            <FaPhoneAlt className="phone-icon-small" />
                            <span className="profile-phone-text">{user.phone}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Container */}
            <div className="menu-container">
                {/* Profile */}
                <Link href="/my-profile" className="menu-item">
                    <div className="menu-left">
                        <FaRegUser className="menu-icon" />
                        <span className="menu-text">Restaurant Profile</span>
                    </div>
                    <FaChevronRight className="arrow-icon" />
                </Link>

                {/* Orders */}
                <Link href="/accepted-restaurants-orders" className="menu-item">
                    <div className="menu-left">
                        <FaBoxOpen className="menu-icon" />
                        <span className="menu-text">My Orders</span>
                    </div>
                    <FaChevronRight className="arrow-icon" />
                </Link>

                {/* My Reviews */}
                <Link href="/my-reviews" className="menu-item">
                    <div className="menu-left">
                        <FaStar className="menu-icon" />
                        <span className="menu-text">My Reviews</span>
                    </div>
                    <FaChevronRight className="arrow-icon" />
                </Link>

                {/* Contact Us */}
                <Link href="/contact-us" className="menu-item">
                    <div className="menu-left">
                        <FaEnvelope className="menu-icon" />
                        <span className="menu-text">Contact Us</span>
                    </div>
                    <FaChevronRight className="arrow-icon" />
                </Link>

                {/* Logout */}
                <div onClick={handleLogout} className="menu-item logout-item">
                    <div className="menu-left">
                        <FaSignOutAlt className="menu-icon logout-icon" />
                        <span className="menu-text logout-text">Logout</span>
                    </div>
                    <FaChevronRight className="arrow-icon logout-arrow" />
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="logout-modal-overlay" onClick={cancelLogout}>
                    <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="logout-modal-icon-container">
                            <div className="logout-red-circle">
                                <FaSignOutAlt className="modal-logout-icon" />
                            </div>
                        </div>
                        <h2 className="logout-modal-title">Are you sure you want to logout?</h2>
                        <button className="confirm-logout-btn" onClick={confirmLogout}>
                            Logout
                        </button>
                        <button className="cancel-logout-link" onClick={cancelLogout}>
                            Not now
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&display=swap');
                
                .settings-container {
                    font-family: 'Montserrat', sans-serif !important;
                }
            `}</style>
        </div>
    );
}
