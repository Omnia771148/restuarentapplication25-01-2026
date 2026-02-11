"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Loading from '../loading/page';
import { FaCheckCircle, FaPrint, FaSyncAlt, FaExclamationCircle } from "react-icons/fa";
import "../orders/orders.css";

// --- Sub-Component: Order Card ---
const OrderCard = ({ order }) => {
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
            <th className="text-center">QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={`${order._id}-item-${idx}`}>
              <td className="item-name">{item.name}</td>
              <td className="text-center">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider-line"></div>

      {/* Total Counts */}
      <div className="d-flex justify-content-between mt-2 fw-bold">
        <span>Total Items: {order.items.length}</span>
        <span>Total Quantity: {totalQuantity}</span>
      </div>

      {/* Status & Actions */}
      <div className="payment-status d-flex justify-content-between align-items-center mt-3">
        <div>
          <span className="badge bg-success text-white px-3 py-2 rounded-pill" style={{ fontSize: '0.9rem' }}>
            Accepted
          </span>
        </div>

        {/* Print Invoice Button */}
        <Link
          href={`/invoice/${order._id}`}
          target="_blank"
          className="btn btn-primary d-flex align-items-center hover-scale"
          style={styles.printBtn}
        >
          <FaPrint className="me-2" /> Print Invoice
        </Link>
      </div>
    </div>
  );
};

export default function AcceptedOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="container-fluid p-3 pb-5">
      {/* Header */}
      <div className="d-flex justify-content-center align-items-center mb-4 position-relative">
        <div className="page-header">
          <FaCheckCircle className="header-icon text-success" />
          <span>Accepted Orders</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchOrders}
          className="btn btn-light position-absolute end-0 me-3 rounded-circle shadow-sm"
          title="Refresh List"
          style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <FaSyncAlt className="text-muted" />
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {sortedOrders.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              <p>No accepted orders found</p>
            </div>
          ) : (
            sortedOrders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))
          )}
        </div>
      </div>
    </div>
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