"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Loading from '../loading/page';
import { FaCheckCircle, FaPrint } from "react-icons/fa";
import "../orders/orders.css"; // Reuse the same CSS

export default function AcceptedOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restaurantId = localStorage.getItem("restid");

    if (!restaurantId) {
      alert("Restaurant ID missing");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `/api/accepted-orders?restaurantId=${restaurantId}`
        );

        if (res.data.success) {
          const apiOrders = res.data.orders;

          // Sort by date (newest first)
          apiOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

          setOrders(apiOrders);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="container-fluid p-3 pb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header">
          <FaCheckCircle className="header-icon text-success" />
          <span>Accepted Orders</span>
        </div>

        {/* Navigation Link back/to other pages if needed */}
        <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">Back to Dashboard</Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {orders.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              <p>No accepted orders found</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="order-card position-relative">

                {/* Order ID & Date */}
                <div className="order-id-row">
                  <div>ORDER ID : <span className="order-id-val">{order.orderId || "NA"}</span></div>
                  <div className="order-date-time">
                    {new Date(order.orderDate).toLocaleDateString()}
                    , {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <tr key={idx}>
                        <td className="item-name">{item.name}</td>
                        <td className="text-center">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="divider-line"></div>

                {/* Total Counts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold' }}>
                  <span>Total Items: {order.items.length}</span>
                  <span>Total Quantity: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>

                {/* Status & Actions */}
                <div className="payment-status d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span>Status: </span>
                    <span className="badge bg-success text-white px-3 py-2 rounded-pill" style={{ fontSize: '0.9rem' }}>Accepted</span>
                  </div>

                  {/* Print Invoice Button */}
                  <Link
                    href={`/invoice/${order._id}`}
                    target="_blank"
                    className="btn btn-primary d-flex align-items-center"
                    style={{ borderRadius: '20px', padding: '8px 20px', fontWeight: 'bold' }}
                  >
                    <FaPrint className="me-2" /> Print Invoice
                  </Link>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}