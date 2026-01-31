'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaHome, FaBell, FaClipboardList, FaCog } from 'react-icons/fa';
import './navbar.css';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (path) => {
        router.push(path);
    };

    // Don't show navbar on login page
    if (pathname === '/') return null;

    return (
        <div className="navbar-container">
            {/* 1. Dashboard (Home) */}
            <button
                className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigation('/dashboard')}
            >
                <FaHome className="nav-icon" />
            </button>

            {/* 2. Orders (Bell) */}
            <button
                className={`nav-item ${pathname === '/orders' ? 'active' : ''}`}
                onClick={() => handleNavigation('/orders')}
            >
                <FaBell className="nav-icon" />
            </button>

            {/* 3. Accepted Orders (List) */}
            <button
                className={`nav-item ${pathname === '/AcceptedOrdersList' ? 'active' : ''}`}
                onClick={() => handleNavigation('/AcceptedOrdersList')}
            >
                <FaClipboardList className="nav-icon" />
            </button>

            {/* 4. Settings (Gear) - No Action yet */}
            <button
                className="nav-item"
                onClick={() => alert("Settings coming soon!")}
            >
                <FaCog className="nav-icon" />
            </button>
        </div>
    );
}
