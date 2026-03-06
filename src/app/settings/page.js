"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCog, FaStar, FaEnvelope, FaChevronRight, FaRegUser, FaBoxOpen, FaSignOutAlt } from "react-icons/fa";
import "./settings.css";

export default function SettingsPage() {
    const router = useRouter();

    const handleLogout = () => {
        const id = localStorage.getItem("restid");
        if (id) localStorage.removeItem(`mobileConnected_${id}`);

        localStorage.removeItem("restid");
        localStorage.removeItem("restlocation");
        localStorage.removeItem("loginTime");
        router.push("/");
    };

    return (
        <div className="settings-container">

            {/* Page Title */}
            <div className="page-title-pill">
                <FaCog className="settings-icon-spin" />
                <span>Settings</span>
            </div>

            {/* Menu Container */}
            <div className="menu-container">

                {/* Profile */}
                <Link href="/my-profile" className="menu-item">
                    <div className="menu-left">
                        <FaRegUser className="menu-icon" />
                        <span className="menu-text">My Profile</span>
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

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap');
                
                .settings-container {
                    font-family: 'Montserrat', sans-serif !important;
                }
            `}</style>
        </div>
    );
}
