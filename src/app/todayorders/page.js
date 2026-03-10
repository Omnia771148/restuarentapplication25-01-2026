'use client';

import { useEffect, useState } from "react";
import axios from "axios";
// Import the custom pizza loading component
import Loading from "../loading/page";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restaurantId = localStorage.getItem("restid");
    if (!restaurantId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `/api/orders/history?restaurantId=${restaurantId}`
        );

        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Updated to return your custom pizza loading page
  if (loading) return <Loading />;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Order History (Accepted & Rejected)</h2>

      {orders.length === 0 ? (
        <p>No order history found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orders.map(order => (
            <li
              key={order._id}
              style={{
                marginBottom: "12px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor:
                  order.orderStatus === "accepted"
                    ? "#e8f5e9"
                    : "#fdecea"
              }}
            >
              <p>
                <strong>Order ID:</strong> {order.orderId}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {order.orderStatus === "accepted"
                  ? "✅ Accepted"
                  : "❌ Rejected"}
              </p>

              <p>
                <strong>Total:</strong> ₹{(order.totalPrice * 0.88).toFixed(2)}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.orderDate).toLocaleString()}
              </p>

              <p><strong>Items:</strong></p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.quantity} — <span style={{textDecoration: 'line-through', color: '#999'}}>₹{item.price}</span> <strong>₹{(item.price * 0.88).toFixed(2)}</strong> <small style={{color: '#d9534f'}}>-12%</small>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}