"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
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
                <div className="loading-container">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
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

    const handlePrintInvoice = (order) => {
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${order.orderId}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
                        .header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
                        .restaurant-name { font-size: 1.5rem; font-weight: bold; text-transform: uppercase; margin: 0; }
                        .order-meta { margin: 15px 0; font-size: 0.9rem; text-align: left; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; }
                        .items-table th { border-bottom: 1px solid #000; padding: 5px 0; text-align: left; }
                        .items-table td { padding: 5px 0; text-align: left; }
                        .text-right { text-align: right !important; }
                        .total-section { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; font-size: 1.1rem; text-align: right; }
                        .footer { margin-top: 30px; font-size: 0.8rem; color: #555; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="restaurant-name">Restaurant Invoice</h1>
                        <p>Thank you for your order!</p>
                    </div>
                    
                    <div class="order-meta">
                        <p><strong>Order ID:</strong> ${order.orderId}</p>
                        <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                        ${order.userName ? `<p><strong>Customer:</strong> ${order.userName}</p>` : ''}
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th class="text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td class="text-right">₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <p>Total: ₹${order.grandTotal || order.totalPrice}</p>
                    </div>

                    <div class="footer">
                        <p>-- End of Receipt --</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="accepted-orders-container">
            {/* Header */}
            <div className="orders-header">
                <button onClick={() => router.back()} className="back-button">
                    <FaChevronLeft />
                </button>
                <div className="header-title-pill">
                    <FaClipboardList className="header-icon" />
                    <span>Accepted Orders</span>
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

                            <button
                                className="invoice-btn"
                                onClick={() => handlePrintInvoice(order)}
                            >
                                <FaClipboardList /> Generate Invoice
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
