"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../loading/page";
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "../orders/orders.css"; // Reuse themed CSS

export default function MyProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restId = localStorage.getItem("restid");
        if (!restId) {
            window.location.href = "/";
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/profile?restId=${restId}`);
                if (res.data.success) {
                    setUser(res.data.user);
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="container-fluid p-3 pb-5" style={{ backgroundColor: '#fcfbf7', minHeight: '100vh' }}>
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
                        <div className="order-card p-4">
                            <div className="text-center mb-4">

                                <h2 className="mt-2" style={{ fontWeight: '800' }}>Restaurant Profile</h2>
                            </div>

                            <div className="divider-line"></div>

                            {/* Email */}
                            <div className="d-flex align-items-center mb-4">
                                <div className="me-3" style={{ fontSize: '1.5rem', color: '#666' }}>
                                    <FaEnvelope />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Email Address</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.email}</div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="d-flex align-items-center mb-4">
                                <div className="me-3" style={{ fontSize: '1.5rem', color: '#666', transform: 'rotate(90deg)' }}>
                                    <FaPhone />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Phone Number</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.phone}</div>
                                </div>
                            </div>

                            <div className="divider-line"></div>

                            {/* Location Button */}
                            <div className="mt-4">
                                <div style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', marginBottom: '15px' }}>Location</div>
                                <a
                                    href={user.restLocation}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn w-100 d-flex align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: '#e6e0d0',
                                        color: '#000',
                                        borderRadius: '50px',
                                        padding: '15px',
                                        fontWeight: '800',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                        border: 'none'
                                    }}
                                >
                                    <FaMapMarkerAlt className="me-2" /> Open In Google Maps
                                </a>
                            </div>
                        </div>
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
