"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChevronLeft, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Loading from "../loading/page";
import "./accepted-orders.css";

export default function AcceptedByRestaurantsOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurantId, setRestaurantId] = useState(null);

    useEffect(() => {
        // 1. Get restaurant ID from local storage
        const storedRestId = localStorage.getItem("restid");

        if (!storedRestId) {
            setError("No Restaurant ID found in Local Storage. Please login.");
            setLoading(false);
            return;
        }

        setRestaurantId(storedRestId);

        const fetchOrders = async () => {
            try {
                const res = await axios.get(
                    `/api/accepted-by-restaurants?restaurantId=${storedRestId}`
                );

                if (res.data.success) {
                    setOrders(res.data.orders);
                } else {
                    setError(res.data.message || "Failed to fetch orders");
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <Loading />;
    }


    if (error) {
        return (
            <div className="accepted-orders-container">
                <div className="orders-header">
                    <button onClick={() => router.back()} className="back-button">
                        <FaChevronLeft />
                    </button>
                    <div className="header-title-pill">
                        <FaClipboardList className="header-icon" />
                        <span>Accepted Orders</span>
                    </div>
                </div>
                <div className="error-container">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-outline-dark mt-3">Retry</button>
                </div>
            </div>
        );
    }



    return (
        <div className="accepted-orders-container">
            {/* Header */}
            <div className="orders-header">
                <button onClick={() => router.back()} className="back-button">
                    <FaChevronLeft />
                </button>
                <div className="header-title-pill">
                    <FaClipboardList className="header-icon" />
                    <span>My Orders</span>
                </div>
            </div>

            {/* Orders List */}
            <div className="container p-0">
                {orders.length === 0 ? (
                    <div className="text-center p-5 text-muted">
                        <p>No accepted orders found for this restaurant.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header-row">
                                <div className="order-id-container">
                                    <span className="order-id-label">Order id:</span>
                                    <span className="order-id">{order.orderId}</span>
                                </div>
                                <div className="order-date-container">
                                    <span className="order-date">
                                        {new Date(order.orderDate).toLocaleDateString()}, {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div className="order-details-box">
                                <div className="items-table-header">
                                    <span style={{ flex: 1 }}>Item</span>
                                    <span style={{ width: '60px', textAlign: 'center' }}>Qty</span>
                                    <span style={{ width: '80px', textAlign: 'right' }}>Price</span>
                                </div>

                                <div className="order-items-list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty-badge">x{item.quantity}</span>
                                            <span className="item-price">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-total-row">
                                    <span className="total-label">Total</span>
                                    <span className="total-amount">₹{order.grandTotal || order.totalPrice}</span>
                                </div>
                            </div>

                            <Link
                                href={`/invoice/${order._id}?source=restaurant`}
                                target="_blank"
                                className="invoice-btn text-decoration-none d-inline-flex align-items-center justify-content-center"
                            >
                                <FaClipboardList className="me-2" /> Generate Invoice
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
