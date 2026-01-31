'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
// Import the Loading component (ensure the path matches where you saved the pizza code)
import Loading from '../loading/page';


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

          // Get locally saved accepted orders
          const localOrders = JSON.parse(localStorage.getItem(`acceptedOrders_${restaurantId}`)) || [];

          // Merge API orders with Local orders (avoid duplicates by Order ID)
          const orderMap = new Map();

          // Prioritize local orders (in case they were deleted from DB but exist locally)
          localOrders.forEach(o => orderMap.set(o.orderId, o));
          apiOrders.forEach(o => orderMap.set(o.orderId, o));

          const mergedOrders = Array.from(orderMap.values());

          // Sort by date (newest first)
          mergedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

          // Save back to local storage
          localStorage.setItem(`acceptedOrders_${restaurantId}`, JSON.stringify(mergedOrders));

          setOrders(mergedOrders);
        }
      } catch (err) {
        console.error(err);
        // If API fails, load from local storage
        const localOrders = JSON.parse(localStorage.getItem(`acceptedOrders_${restaurantId}`)) || [];
        setOrders(localOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Use the pizza loading page instead of the plain text
  if (loading) return <Loading />;

  return (
    <div style={{ padding: "20px" }}>
      <h2>✅ Accepted Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map(order => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "15px"
            }}
          >
            <p><strong>Order ID:</strong> {order.orderId}</p>
            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Total:</strong> ₹{order.totalPrice}</p>

            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name} × {item.quantity} — ₹{item.price}
                </li>
              ))}
            </ul>

            {/* PRINT BUTTON */}
            <Link
              href={`/invoice/${order._id}`}
              target="_blank"
              style={{
                backgroundColor: "#2196F3",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
                marginTop: "8px"
              }}
            >
              🖨 Print Invoice
            </Link>
          </div>
        ))
      )}

    </div>
  );
}