"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCog, FaEdit, FaEnvelope, FaPlay } from "react-icons/fa";
import { BsMailbox2Flag } from "react-icons/bs";
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
            {/* Top Header */}
            <div className="top-header">
                <div className="logo-circle"></div>
                <div className="header-text">
                    <span className="brand-text">SPV</span>
                    <div className="sub-header-text">
                        <span>Delivery partner app</span>
                        <span>Thanks for your service</span>
                    </div>
                </div>
            </div>

            {/* Page Title */}
            <div className="page-title-pill">
                <FaCog className="settings-icon-spin" />
                <span>Setting</span>
            </div>

            {/* Menu Container */}
            <div className="menu-container">

                {/* Profile */}
                <Link href="/my-profile" className="menu-item">
                    <div className="menu-left">
                        <FaEdit className="menu-icon" />
                        <span className="menu-text">my profile</span>
                    </div>
                    <FaPlay className="arrow-icon" />
                </Link>

                {/* Orders */}
                <Link href="/accepted-restaurants-orders" className="menu-item">
                    <div className="menu-left">
                        <BsMailbox2Flag className="menu-icon" />
                        <span className="menu-text">My Orders</span>
                    </div>
                    <FaPlay className="arrow-icon" />
                </Link>

                {/* Contact Us */}
                <Link href="/contact-us" className="menu-item">
                    <div className="menu-left">
                        <FaEnvelope className="menu-icon" /> {/* Using Envelope for Contact Us */}
                        <span className="menu-text">Contact Us</span>
                    </div>
                    <FaPlay className="arrow-icon" />
                </Link>

                {/* Logout */}
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>

        </div>
    );
}
