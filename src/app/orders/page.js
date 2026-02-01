"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../loading/page";
import useFcmToken from "@/hooks/useFcmToken";
import { FaBell, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./orders.css"; // Custom Styles

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hasMobileApp, setHasMobileApp] = useState(false);
  const { token, notificationPermissionStatus } = useFcmToken();
  const router = useRouter();

  const rest =
    typeof window !== "undefined"
      ? localStorage.getItem("restlocation")
      : null;

  const prevOrdersRef = useRef([]);
  const activeRef = useRef(false);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  const enableAudio = () => {
    setAudioEnabled(true);
    localStorage.setItem("audioEnabled", "true");
    const audio = new Audio("/noti.mp3");
    audio.play().catch(() => { });
  };

  const handleLogout = () => {
    const id = localStorage.getItem("restid");
    if (id) localStorage.removeItem(`mobileConnected_${id}`);

    localStorage.removeItem("restid");
    localStorage.removeItem("restlocation");
    localStorage.removeItem("loginTime");
    router.push("/");
  };

  useEffect(() => {
    if (localStorage.getItem("audioEnabled") === "true") {
      setAudioEnabled(true);
    }

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
      alert("No Restaurant ID found");
      setLoading(false);
      return;
    }

    const fetchRestaurantStatus = async () => {
      try {
        const res = await axios.get(
          `/api/restaurant-status?restaurantId=${restaurantId}`
        );
        if (res.data.success) {
          setIsActive(res.data.isActive);
        }
      } catch (err) {
        console.error("Status fetch error", err);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `/api/orders?restaurantId=${restaurantId}`
        );

        if (res.data.success) {
          const newOrders = res.data.orders;
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

  async function acceptOrder(orderId, razorpayOrderId) {
    setLoading(true);
    const orderToAccept = orders.find((o) => o._id === orderId);

    try {
      const res = await axios.post("/api/orders/accept", {
        orderId,
        rest,
        razorpayOrderId,
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
      setLoading(false);
    }
  }

  async function rejectOrder(orderId) {
    setLoading(true);
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
      setLoading(false);
    }
  }

  const removeOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
    prevOrdersRef.current = prevOrdersRef.current.filter(
      (o) => o._id !== orderId
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="container-fluid p-3 pb-5">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header">
          <FaBell className="header-icon" />
          <span>Orders</span>
        </div>

        <div>
          <button onClick={handleLogout} className="btn btn-danger btn-sm me-2">
            Logout
          </button>
          {/* Navigation Links as Badges or Buttons */}
          <Link href="/AcceptedOrdersList" className="btn btn-outline-primary btn-sm me-1">Live</Link>
          <Link href="/accepted-restaurants-orders" className="btn btn-outline-secondary btn-sm">History</Link>
        </div>
      </div>

      {/* Mobile App Connection Prompt */}
      {!hasMobileApp && (
        <div className="alert alert-info d-flex flex-column align-items-center mb-4">
          <h5 className="mb-2">📱 Enable Notifications</h5>
          <button
            onClick={() => {
              const id = localStorage.getItem("restid");
              if (id) {
                window.location.href = `restaurantapp://register?id=${id}`;
                localStorage.setItem(`mobileConnected_${id}`, "true");
                setHasMobileApp(true);
              } else {
                alert("Please log in first");
              }
            }}
            className="btn btn-primary"
          >
            Connect Mobile App 🚀
          </button>
        </div>
      )}

      {/* Sound Toggle */}
      {!audioEnabled && (
        <div className="text-center mb-3">
          <button onClick={enableAudio} className="btn btn-warning text-white">
            Enable Sound 🔔
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {orders.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              <h4>No new orders</h4>
              <p>Waiting for orders to arrive...</p>
            </div>
          ) : (
            orders.map((order) => (
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
                      {/* Cost column removed as per request */}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="item-name">{item.name}</td>
                        <td className="text-center">{item.quantity}</td>
                        {/* Cost cell removed */}
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

                {/* Calculated Totals (Visual only, based on items) */}
                {/* User asked to HIDE Total price. I will comment this out or strictly follow "not show in UI". 
                     However, the screenshot has Sub Total, GST, Total. 
                     The USER TEXT overrides the screenshot: "no need to show Total price and Userid".
                     So I will NOT render the Total section. 
                 */}

                {/* 
                <div className="price-row">
                    <span>Sub Total</span>
                    <span>{order.totalPrice}</span>
                </div>
                */}

                {/* Payment Status */}
                <div className="payment-status">
                  <span>Payment status - </span>
                  <FaCheckCircle className="status-icon ms-2" />
                  <span className="text-success">Complete</span>
                </div>

                {/* Buttons */}
                <div className="action-buttons">
                  <button
                    className="btn-accept"
                    onClick={() => acceptOrder(order._id, order.razorpayOrderId)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => rejectOrder(order._id)}
                  >
                    Reject
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}