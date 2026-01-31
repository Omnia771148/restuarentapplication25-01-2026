"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";
// Import your custom loading component
import Loading from "../loading/page";
import useFcmToken from "@/hooks/useFcmToken"; // Import the hook

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hasMobileApp, setHasMobileApp] = useState(false); // 👈 Controls button visibility
  const { token, notificationPermissionStatus } = useFcmToken(); // Use the hook
  const router = useRouter(); // Initialize router

  const rest =
    typeof window !== "undefined"
      ? localStorage.getItem("restlocation")
      : null;

  const prevOrdersRef = useRef([]);

  // Enable audio notification
  const enableAudio = () => {
    setAudioEnabled(true);
    localStorage.setItem("audioEnabled", "true");
    const audio = new Audio("/noti.mp3");
    audio.play().catch(() => { });
  };

  // 🔹 Logout Function
  const handleLogout = () => {
    const id = localStorage.getItem("restid");
    if (id) localStorage.removeItem(`mobileConnected_${id}`); // Clear flag so it shows again next time

    localStorage.removeItem("restid");
    localStorage.removeItem("restlocation");
    localStorage.removeItem("loginTime");
    router.push("/"); // Redirect to login page
  };

  useEffect(() => {
    if (localStorage.getItem("audioEnabled") === "true") {
      setAudioEnabled(true);
    }

    // Check if we already connected in this session
    const id = localStorage.getItem("restid");
    if (id && localStorage.getItem(`mobileConnected_${id}`) === "true") {
      setHasMobileApp(true);
    } else {
      setHasMobileApp(false);
    }
  }, []);

  useEffect(() => {
    const restaurantId = localStorage.getItem("restid");

    if (!restaurantId) {
      // If we are already checking for ID and alerting, we might want to just redirect here too if it fails, 
      // but let's leave the existing logic as is, just ensuring logout works manually.
      alert("No Restaurant ID found");
      setLoading(false);
      return;
    }

    // 🔹 Fetch restaurant ACTIVE / INACTIVE status
    const fetchRestaurantStatus = async () => {
      try {
        const res = await axios.get(
          `/api/restaurant-status?restaurantId=${restaurantId}`
        );
        if (res.data.success) {
          setIsActive(res.data.isActive);
          // Always show button now
        }
      } catch (err) {
        console.error("Status fetch error", err);
      }
    };

    // 🔹 Fetch orders
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `/api/orders?restaurantId=${restaurantId}`
        );

        if (res.data.success) {
          const newOrders = res.data.orders;

          const prevIds = prevOrdersRef.current.map((o) => o._id);
          const newIds = newOrders.map((o) => o._id);

          const hasNewOrder = newIds.some((id) => !prevIds.includes(id));

          if (hasNewOrder && audioEnabled && isActive) {
            const audio = new Audio("/noti.mp3");
            audio.play().catch(() => { });
          }

          setOrders(newOrders);
          prevOrdersRef.current = newOrders;
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantStatus();
    fetchOrders();

    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [audioEnabled]);

  // 🔹 Update restaurant status
  const updateRestaurantStatus = async (status) => {
    setIsActive(status);

    await axios.patch("/api/restaurant-status", {
      restaurantId: localStorage.getItem("restid"),
      isActive: status,
    });
  };

  // 🔹 ACCEPT ORDER (Updated to send razorpayOrderId)
  async function acceptOrder(orderId, razorpayOrderId) {
    setLoading(true); // Start loading

    // 🟢 BACKUP TO LOCAL STORAGE IMMEDIATELY
    // This ensures that even if you delete from MongoDB immediately after, 
    // it is already saved in the restaurant's local browser.
    const orderToAccept = orders.find((o) => o._id === orderId);
    if (orderToAccept) {
      const restId = localStorage.getItem("restid");
      const lsKey = `acceptedOrders_${restId}`;
      const existing = JSON.parse(localStorage.getItem(lsKey)) || [];

      // Avoid duplicates based on the unique 'orderId'
      if (!existing.some((o) => o.orderId === orderToAccept.orderId)) {
        // Save it!
        const entry = { ...orderToAccept, razorpayOrderId };
        existing.push(entry);
        localStorage.setItem(lsKey, JSON.stringify(existing));
      }
    }

    try {
      const res = await axios.post("/api/orders/accept", {
        orderId,
        rest,
        razorpayOrderId, // 👈 Sending the ID here
      });

      if (res.data.success) {
        alert("✅ Order accepted");
        removeOrder(orderId);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Accept error:", err);
      alert("Error accepting order");
    } finally {
      setLoading(false); // Stop loading
    }
  }

  // 🔹 REJECT ORDER
  async function rejectOrder(orderId) {
    setLoading(true); // Start loading
    try {
      const res = await axios.post("/api/orders/reject", { orderId });

      if (res.data.success) {
        alert("❌ Order rejected");
        removeOrder(orderId);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Reject error:", err);
      alert("Error rejecting order");
    } finally {
      setLoading(false); // Stop loading
    }
  }

  const removeOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
    prevOrdersRef.current = prevOrdersRef.current.filter(
      (o) => o._id !== orderId
    );
  };

  // Replace text loading with your custom component
  if (loading) return <Loading />;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🧾 Orders for Your Restaurant</h2>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ff4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* 🔹 DEEP LINK BUTTON (Shows if not yet connected in this session) */}
      {!hasMobileApp && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #2196f3' }}>
          <h3>📱 Setup Mobile Notifications</h3>
          <p>Click below to connect your installed Android App automatically.</p>
          <button
            onClick={() => {
              const id = localStorage.getItem("restid");
              if (id) {
                window.location.href = `restaurantapp://register?id=${id}`;
                // Mark as connected in local storage so it hides for this session
                localStorage.setItem(`mobileConnected_${id}`, "true");
                setHasMobileApp(true);
              } else {
                alert("Please log in first");
              }
            }}
            style={{
              backgroundColor: "#2196f3", // Blue
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: 'bold'
            }}
          >
            Connect Mobile App 🚀
          </button>
        </div>
      )}


      {/* 🔥 ACTIVE / INACTIVE BUTTONS */}
      <div style={{ marginBottom: "15px" }}>
        <h3>
          Restaurant Status:{" "}
          <span style={{ color: isActive ? "green" : "red" }}>
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </h3>

        <button
          onClick={() => updateRestaurantStatus(true)}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "8px 16px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          ACTIVE
        </button>

        <button
          onClick={() => updateRestaurantStatus(false)}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          INACTIVE
        </button>
      </div>

      <Link href="/AcceptedOrdersList">Live</Link><br></br>
      <Link href="/accepted-restaurants-orders">Order History</Link><br></br>
      <Link href="/status-control" style={{ color: "blue", textDecoration: "underline" }}>Status Control</Link>

      <br />
      <br />

      {!audioEnabled && (
        <button
          onClick={enableAudio}
          style={{
            marginBottom: "12px",
            padding: "6px 12px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Enable Sound 🔔
        </button>
      )}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orders.map((order) => (
            <li
              key={order._id}
              style={{
                marginBottom: "12px",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {/* Items */}
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} — ₹{item.price} × {item.quantity}
                  </li>
                ))}
              </ul>

              {/* Schema details */}
              <p>
                <strong>User ID:</strong> {order.userId}
              </p>
              <p>
                <strong>Total Count:</strong> {order.totalCount}
              </p>
              <p>
                <strong>Total Price:</strong> ₹{order.totalPrice}
              </p>

              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(order.orderDate).toLocaleString()}
              </p>
              <p>
                <strong>Order ID:</strong> {order.orderId}
              </p>


              {/* Action buttons */}
              <button
                // 👈 PASSING BOTH IDs HERE
                onClick={() => acceptOrder(order._id, order.razorpayOrderId)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Accept
              </button>

              <button
                onClick={() => rejectOrder(order._id)}
                style={{
                  marginLeft: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}