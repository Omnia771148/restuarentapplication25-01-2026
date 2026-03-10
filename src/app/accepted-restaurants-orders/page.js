"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChevronLeft, FaCheckCircle, FaClipboardList, FaPrint, FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Loading from "../loading/page";
import "./accepted-orders.css";

export default function AcceptedByRestaurantsOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurantId, setRestaurantId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    const handlePrintRequest = (order) => {
        setSelectedOrder(order);
        setShowInvoice(true);
        setTimeout(() => {
            window.print();
        }, 800);
    };

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
        <>
            <div className="accepted-orders-container print-hide">
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
                                                <span className="item-price">
                                                    <div style={{fontSize: '0.75rem', textDecoration: 'line-through', color: '#999'}}>₹{item.price * item.quantity}</div>
                                                    <div>₹{(item.price * 0.88 * item.quantity).toFixed(2)} <span style={{fontSize: '0.7rem', color: '#dc3545'}}>-12%</span></div>
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-total-row">
                                        <span className="total-label">Total</span>
                                        <span className="total-amount">₹{((order.grandTotal || order.totalPrice) * 0.88).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePrintRequest(order)}
                                    className="invoice-btn text-decoration-none d-inline-flex align-items-center justify-content-center"
                                    style={{ border: 'none' }}
                                >
                                    <FaClipboardList className="me-2" /> Generate Invoice
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Invoice Modal Overlay */}
            {showInvoice && selectedOrder && (
                <div className="invoice-modal-overlay">
                    <div className="invoice-modal-content">
                        <button className="close-invoice-btn no-print" onClick={() => setShowInvoice(false)}>
                            <FaTimes />
                        </button>

                        <div className="printable-invoice">
                            <div className="invoice-header-box">
                                <h3 className="m-0">🍽 {selectedOrder.restaurantName || "Restaurant Invoice"}</h3>
                                <p className="invoice-subtext">Address: {selectedOrder.address || "None"}</p>
                                <p className="invoice-subtext">FSSAI: {selectedOrder.fssai || "None"}</p>
                            </div>

                            <div className="invoice-dashed-divider"></div>

                            <div className="invoice-info-row">
                                <span><strong>Order ID: {selectedOrder.orderId}</strong></span>
                            </div>
                            <div className="invoice-info-row">
                                <span><strong>Date: {new Date(selectedOrder.orderDate).toLocaleString()}</strong></span>
                            </div>

                            <div className="invoice-dashed-divider"></div>

                            <div className="invoice-items-container">
                                <div className="invoice-item-line" style={{ fontWeight: 'bold', borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '10px' }}>
                                    <span style={{flex: 2}}>ITEM</span>
                                    <span style={{flex: 1, textAlign: 'center'}}>QTY</span>
                                    <span style={{flex: 1, textAlign: 'right'}}>PRICE</span>
                                </div>
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="invoice-item-line">
                                        <span style={{flex: 2, fontWeight: 'bold'}}>{item.name}</span>
                                        <span style={{flex: 1, textAlign: 'center', fontWeight: 'bold'}}>{item.quantity}</span>
                                        <span style={{flex: 1, textAlign: 'right', fontWeight: 'bold'}}>₹{(item.price * 0.88 * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="invoice-dashed-divider"></div>

                            <div className="invoice-total-line">
                                <span>Grand Total</span>
                                <span>₹{(selectedOrder.totalPrice * 0.88).toFixed(2)}</span>
                            </div>

                            <div className="invoice-footer">
                                <p>🙏 Thank you for ordering!</p>
                            </div>
                        </div>

                        <div className="modal-actions mt-4 no-print">
                            <button className="btn btn-dark w-100 rounded-pill py-2" onClick={() => window.print()}>
                                <FaPrint className="me-2" /> Print Again
                            </button>
                        </div>
                    </div>

                    <style jsx global>{`
                        @media print {
                            /* Definitively remove the rest of the page from the printer */
                            .print-hide, 
                            nav, 
                            .navbar, 
                            .navbar-container,
                            .footer,
                            header,
                            .no-print {
                                display: none !important;
                                visibility: hidden !important;
                                height: 0 !important;
                                width: 0 !important;
                                overflow: hidden !important;
                            }

                            body {
                                background: white !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }

                            .invoice-modal-overlay {
                                position: static !important;
                                background: white !important;
                                display: block !important;
                                width: 100% !important;
                                height: auto !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                overflow: visible !important;
                            }

                            .invoice-modal-content {
                                background: white !important;
                                box-shadow: none !important;
                                width: 100% !important;
                                max-width: none !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                display: block !important;
                            }

                            .no-print {
                                display: none !important;
                                visibility: hidden !important;
                            }

                            .printable-invoice {
                                padding: 0 !important;
                                margin: 0 !important;
                                border: none !important;
                                width: 100% !important;
                                display: block !important;
                            }
                        }

                        /* Standard Modal Styles */
                        .invoice-modal-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0,0,0,0.7);
                            z-index: 2000;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 20px;
                        }
                        .invoice-modal-content {
                            background: #f7f7eb;
                            width: 100%;
                            max-width: 400px;
                            border-radius: 25px;
                            padding: 30px 20px;
                            position: relative;
                            max-height: 90vh;
                            overflow-y: auto;
                        }
                        .close-invoice-btn {
                            position: absolute;
                            top: 15px;
                            right: 15px;
                            background: #E6DCC8;
                            border: none;
                            width: 35px;
                            height: 35px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                        }
                        .printable-invoice {
                            background: white;
                            padding: 25px 15px;
                            border-radius: 15px;
                            font-family: 'Courier New', Courier, monospace;
                            color: black;
                        }
                        .invoice-header-box {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .invoice-subtext {
                            font-size: 11px;
                            margin: 3px 0;
                            color: #555;
                        }
                        .invoice-dashed-divider {
                            border-top: 1px dashed #7a7a7a;
                            margin: 15px 0;
                        }
                        .invoice-info-row {
                            font-size: 12px;
                            margin-bottom: 5px;
                        }
                        .invoice-item-line {
                            display: flex;
                            justify-content: space-between;
                            margin: 8px 0;
                            font-size: 13px;
                        }
                        .invoice-total-line {
                            display: flex;
                            justify-content: space-between;
                            font-weight: bold;
                            font-size: 17px;
                            margin-top: 10px;
                        }
                        .invoice-footer {
                            text-align: center;
                            margin-top: 25px;
                            font-size: 13px;
                            font-style: italic;
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}
