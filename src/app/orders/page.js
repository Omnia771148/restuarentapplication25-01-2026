'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const rest = typeof window !== "undefined" ? localStorage.getItem("restlocation") : null;
  const prevOrdersRef = useRef([]);

  // Enable audio on first click
  const enableAudio = () => {
    setAudioEnabled(true);
    const audio = new Audio('/noti.mp3');
    audio.play().catch(err => console.error("Audio play failed:", err));
  };

  useEffect(() => {
    const restaurantId = localStorage.getItem("restid");

    if (!restaurantId) {
      alert("No Restaurant ID found in localStorage");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/api/orders?restaurantId=${restaurantId}`);
        if (response.data.success) {
          const newOrders = response.data.orders;

          // Compare previous orders and new orders
          const prevIds = prevOrdersRef.current.map(o => o._id);
          const newIds = newOrders.map(o => o._id);

          const isUpdated = newIds.some(id => !prevIds.includes(id)); // only new orders trigger audio

          if (isUpdated && audioEnabled) {
            const audio = new Audio('/noti.mp3');
            audio.play().catch(err => console.error("Audio play failed:", err));
          }

          setOrders(newOrders);
          prevOrdersRef.current = newOrders;
        } else {
          console.warn("Failed to load orders");
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders(); // initial fetch
    const interval = setInterval(fetchOrders, 3000); // polling
    return () => clearInterval(interval);
  }, [audioEnabled]); // depends on audioEnabled

  async function acceptOrder(orderId) {
    try {
      const res = await axios.post("/api/orders/accept", { orderId, rest });
      if (res.data.success) {
        alert("✅ Order accepted!");
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        prevOrdersRef.current = prevOrdersRef.current.filter(order => order._id !== orderId);
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (err) {
      console.error("❌ Accept order error:", err);
      alert("Something went wrong while accepting the order.");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧾 Orders for Your Restaurant</h2>
      <Link href="/AcceptedOrdersList">Accepted Orders</Link>


      {!audioEnabled && (
        <button
          onClick={enableAudio}
          style={{
            marginBottom: '12px',
            padding: '6px 12px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Enable Notifications 🔔
        </button>
      )}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map((order) => (
            <li
              key={order._id}
              style={{
                marginBottom: '12px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <p><strong>Item(s):</strong></p>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} — ₹{item.price} × {item.quantity}
                    </li>
                  ))}
                </ul>
              ) : <p>No items found in this order.</p>}

              <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
              <p><strong>User ID:</strong> {order.userId}</p>
              <p style={{ fontSize: '1.1em', color: '#333' }}>
                Order ID: {order.orderId}
              </p>
              {order.orderDate && <p><strong>Ordered On:</strong> {new Date(order.orderDate).toLocaleString()}</p>}

              <button
                onClick={() => acceptOrder(order._id)}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Accept
              </button>
            </li>
          ))}

        </ul>
        
      )}
      <div className="row">
                    <button onClick={() => window.location.href = "/Restorentitems"} style={{ backgroundColor: "green" }}>My items</button><br>
                    </br>
                    <button onClick={() => window.location.href = "/AcceptedOrdersList"} style={{ backgroundColor: "red" }}>accepted orders</button>
                </div>
    </div>
  );
}
