"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Loading from '../loading/page';
import { FaCheckCircle, FaPrint, FaSyncAlt, FaExclamationCircle, FaTimes, FaArrowLeft } from "react-icons/fa";
import "../orders/orders.css";

// --- Sub-Component: Order Card ---
const OrderCard = ({ order, onPrint }) => {
  // Memoize totals to avoid recalculation on every render
  const totalQuantity = useMemo(() =>
    order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items]
  );

  const formattedDate = useMemo(() => {
    const dateObj = new Date(order.orderDate);
    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }, [order.orderDate]);

  return (
    <div className="order-card position-relative">
      {/* Order ID & Date */}
      <div className="order-id-row">
        <div>ORDER ID : <span className="order-id-val">{order.orderId || "NA"}</span></div>
        <div className="order-date-time">
          {formattedDate.date}, {formattedDate.time}
        </div>
      </div>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th>ITEMS</th>
            <th className="text-center">QTY</th>
            <th className="text-center">PRICE</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={`${order._id}-item-${idx}`}>
              <td className="item-name">{item.name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-center">₹{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider-line"></div>

      {/* Total Counts */}
      <div className="d-flex justify-content-between mt-2 fw-bold text-center">
        <div className="d-flex flex-column align-items-center">
          <span>Total Items</span>
          <span>{order.items.length}</span>
        </div>
        <div className="d-flex flex-column align-items-center">
          <span>Total QTY</span>
          <span>{totalQuantity}</span>
        </div>
        <div className="d-flex flex-column align-items-center">
          <span>Total Price</span>
          <span>₹{order.totalPrice}</span>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="payment-status d-flex justify-content-between align-items-center mt-3">
        <div>
          <span className="badge bg-success text-white px-3 py-2 rounded-pill" style={{ fontSize: '0.9rem' }}>
            Accepted
          </span>
        </div>

        {/* Print Invoice Button */}
        <button
          onClick={() => onPrint(order)}
          className="btn btn-primary d-flex align-items-center hover-scale"
          style={styles.printBtn}
        >
          <FaPrint className="me-2" /> Print Invoice
        </button>
      </div>
    </div>
  );
};

export default function AcceptedOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const handlePrintRequest = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
    // Auto trigger print after a short delay for modal to render
    setTimeout(() => {
        window.print();
    }, 800);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const restaurantId = localStorage.getItem("restid");

      if (!restaurantId) {
        throw new Error("Restaurant ID missing. Please log in again.");
      }

      const res = await axios.get(
        `/api/accepted-orders?restaurantId=${restaurantId}`
      );

      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        // Fallback if success is false but no error thrown
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sort orders by date (newest first)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  }, [orders]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="container-fluid p-5 text-center">
        <div className="d-flex flex-column align-items-center justify-content-center">
          <FaExclamationCircle className="text-danger mb-3" size={50} />
          <h4 className="text-danger mb-3">Error Loading Orders</h4>
          <p className="text-muted mb-4">{error}</p>
          <button onClick={fetchOrders} className="btn btn-dark rounded-pill px-4 py-2">
            <FaSyncAlt className="me-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid p-3 pb-5 print-hide">
        {/* Header */}
        <div className="d-flex justify-content-center align-items-center mb-4">
          <div className="page-header">
            <FaCheckCircle className="header-icon text-success" />
            <span>Accepted Orders</span>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {sortedOrders.length === 0 ? (
              <div className="text-center mt-5 text-muted">
                <p>No accepted orders found</p>
              </div>
            ) : (
              sortedOrders.map(order => (
                <OrderCard key={order._id} order={order} onPrint={handlePrintRequest} />
              ))
            )}
          </div>
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
                        <span><strong>Order ID:</strong> {selectedOrder.orderId}</span>
                    </div>
                    <div className="invoice-info-row">
                        <span><strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</span>
                    </div>

                    <div className="invoice-dashed-divider"></div>

                    <div className="invoice-items-container">
                        {selectedOrder.items.map((item, i) => (
                            <div key={i} className="invoice-item-line">
                                <span>{item.name} × {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="invoice-dashed-divider"></div>

                    <div className="invoice-total-line">
                        <span>Grand Total</span>
                        <span>₹{selectedOrder.totalPrice}</span>
                    </div>

                    <div className="invoice-footer">
                        <p>🙏 Thank you for ordering!</p>
                    </div>
                </div>

                <div className="modal-actions no-print">
                    <button className="print-again-btn" onClick={() => window.print()}>
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
                .modal-actions {
                    margin-top: 30px;
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }
                .print-again-btn {
                    background-color: #333;
                    color: white;
                    border: none;
                    width: 100%;
                    max-width: 280px;
                    padding: 12px 0;
                    border-radius: 30px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, background-color 0.2s;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .print-again-btn:hover {
                    background-color: #000;
                    transform: translateY(-2px);
                }
                .print-again-btn:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
      )}
    </>
  );
}

const styles = {
  printBtn: {
    borderRadius: '20px',
    padding: '8px 20px',
    fontWeight: 'bold',
    textDecoration: 'none'
  }
};