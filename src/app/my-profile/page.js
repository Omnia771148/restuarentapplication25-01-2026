"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "../loading/page";
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSyncAlt, FaExclamationCircle, FaBuilding, FaChevronLeft } from "react-icons/fa";
import "../orders/orders.css"; // Reuse themed CSS

// --- Sub-Component: Profile Card ---
const ProfileCard = ({ user }) => {
    if (!user) return null;

    return (
        <div className="order-card p-4">
            

        

            {/* Email */}
            <div className="mb-3 px-1">
                <div style={{ ...styles.label, marginBottom: '5px', marginLeft: '8px' }}>Email Address</div>
                <div style={styles.infoRow}>
                    <div className="me-2" style={styles.iconContainer}>
                        <FaEnvelope />
                    </div>
                    <div style={styles.value}>{user.email}</div>
                </div>
            </div>

            {/* Phone */}
            <div className="mb-3 px-1">
                <div style={{ ...styles.label, marginBottom: '5px', marginLeft: '8px' }}>Phone Number</div>
                <div style={styles.infoRow}>
                    <div className="me-2" style={{ ...styles.iconContainer, transform: 'rotate(90deg)' }}>
                        <FaPhone />
                    </div>
                    <div style={styles.value}>{user.phone}</div>
                </div>
            </div>

            {/* Address */}
            <div className="mb-3 px-1">
                <div style={{ ...styles.label, marginBottom: '5px', marginLeft: '8px' }}>Restaurant Address</div>
                <div style={styles.infoRow}>
                    <div className="me-2" style={styles.iconContainer}>
                        <FaBuilding />
                    </div>
                    <div style={styles.value}>{user.address || "None"}</div>
                </div>
            </div>

            {/* FSSAI */}
            <div className="mb-3 px-1">
                <div style={{ ...styles.label, marginBottom: '5px', marginLeft: '8px' }}>FSSAI Number</div>
                <div style={styles.infoRow}>
                    <div className="me-2" style={styles.iconContainer}>
                        <FaUserCircle />
                    </div>
                    <div style={styles.value}>{user.fssai || "None"}</div>
                </div>
            </div>

            {/* Latitude */}
            <div className="mb-3 px-1">
                <div style={{ ...styles.label, marginBottom: '5px', marginLeft: '8px' }}>Latitude</div>
                <div style={styles.infoRow}>
                    <div className="me-2" style={styles.iconContainer}>
                        <FaMapMarkerAlt />
                    </div>
                    <div style={styles.value}>{user.restaurantLocation?.lat}</div>
                </div>
            </div>

            {/* Longitude */}
            <div className="mb-3 px-1">
                <div style={{ ...styles.label, marginBottom: '5px', marginLeft: '8px' }}>Longitude</div>
                <div style={styles.infoRow}>
                    <div className="me-2" style={styles.iconContainer}>
                        <FaMapMarkerAlt />
                    </div>
                    <div style={styles.value}>{user.restaurantLocation?.lng}</div>
                </div>
            </div>

            <div className="divider-line"></div>

            {/* Location Button */}
            <div className="mt-4">
                
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
            <div className="d-flex align-items-center mb-4 position-relative">
                <button
                    onClick={() => router.push('/settings')}
                    className="btn btn-light"
                    style={{ position: 'absolute', left: '0', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                >
                    <FaChevronLeft />
                </button>
                <div className="d-flex justify-content-center w-100">
                    <div className="page-header" style={{ backgroundColor: 'white' }}>
                        <FaUserCircle className="header-icon" />
                        <span>Restaurant Profile</span>
                    </div>
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
            <br></br>
            <br></br>
            <br></br>   
            <br></br>
            <br></br>
        </div>
    );
}

const styles = {
    pageContainer: {
        backgroundColor: '#fcfbf7',
        minHeight: '100vh'
    },
    iconContainer: {
        fontSize: '1.3rem',
        color: '#333',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoRow: {
        backgroundColor: '#fff',
        borderRadius: '30px', /* Match button and pill shapes */
        padding: '8px 15px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        border: '1px solid #eee'
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
        backgroundColor: '#fff',
        color: '#000',
        borderRadius: '50px',
        padding: '15px',
        fontWeight: '800',
        fontSize: '1.1rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        border: '1px solid #ddd'
    },
    refreshBtn: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
};
