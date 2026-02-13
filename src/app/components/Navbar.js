'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaHome, FaBell, FaClipboardList, FaCog } from 'react-icons/fa';
import './navbar.css';
import Loading from '../loading/page';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const lastScrollY = React.useRef(0);

    const handleNavigation = (path) => {
        if (pathname !== path) {
            setIsLoading(true);
        }
        router.push(path);
    };

    React.useEffect(() => {
        setIsLoading(false);
    }, [pathname]);

    React.useEffect(() => {
        // Very low threshold for maximum sensitivity (good for slow scrolls)
        const threshold = 2;
        let lastScrollYValue = window.scrollY;
        let ticking = false;

        const updateNavbarVisibility = () => {
            const currentScrollY = window.scrollY;

            // Sensitivity Check
            const difference = currentScrollY - lastScrollYValue;

            if (Math.abs(difference) < threshold) {
                ticking = false;
                return;
            }

            if (currentScrollY <= 5) {
                // Near the very top, always show
                setIsVisible(true);
            } else if (difference > 0) {
                // Scrolling DOWN (even slowly)
                setIsVisible(false);
            } else {
                // Scrolling UP
                setIsVisible(true);
            }

            lastScrollYValue = currentScrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNavbarVisibility);
                ticking = true;
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', onScroll, { passive: true });
            return () => window.removeEventListener('scroll', onScroll);
        }
    }, []);

    // Don't show navbar on login page
    if (pathname === '/') return null;

    return (
        <>
            {isLoading && <Loading />}
            <div className={`navbar-container ${isVisible ? 'nav-visible' : 'nav-hidden'}`}>
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

                {/* 4. Settings (Gear) */}
                <button
                    className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/settings')}
                >
                    <FaCog className="nav-icon" />
                </button>
            </div>
        </>
    );
}
