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

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    title: "",
    message: "",
    type: "success" // 'success' or 'error'
  });

  const rest =
    typeof window !== "undefined"
      ? localStorage.getItem("restlocation")
      : null;

  const restaurantLocation =
    typeof window !== "undefined"
      ? (() => {
        const item = localStorage.getItem("restaurantLocation");
        return item && item !== "undefined" ? JSON.parse(item) : {};
      })()
      : {};

  const prevOrdersRef = useRef([]);
  const activeRef = useRef(false);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  const showCustomAlert = (title, message, type = "success") => {
    setAlertConfig({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, show: false });
  };

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
    localStorage.removeItem("restaurantLocation");
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
      showCustomAlert("Error", "No Restaurant ID found", "error");
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
    try {
      const res = await axios.post("/api/orders/accept", {
        orderId,
        rest,
        restaurantLocation,
        razorpayOrderId,
      });

      if (res.data.success) {
        showCustomAlert("Order Accepted", "The order has been successfully accepted.", "success");
        removeOrder(orderId);
      } else {
        showCustomAlert("Accept Failed", res.data.message || "Could not accept order.", "error");
      }
    } catch (err) {
      console.error("Accept error:", err);
      showCustomAlert("Error", "Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function rejectOrder(orderId) {
    setLoading(true);
    try {
      const res = await axios.post("/api/orders/reject", { orderId });

      if (res.data.success) {
        showCustomAlert("Order Rejected", "Theis order has been rejected.", "error");
        removeOrder(orderId);
      } else {
        showCustomAlert("Reject Failed", res.data.message || "Could not reject order.", "error");
      }
    } catch (err) {
      console.error("Reject error:", err);
      showCustomAlert("Error", "Failed to connect to server.", "error");
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
      {/* Custom Alert Overlay */}
      {alertConfig.show && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-card">
            <div className={`custom-alert-icon ${alertConfig.type}`}>
              {alertConfig.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
            </div>
            <h3 className="custom-alert-title">{alertConfig.title}</h3>
            <p className="custom-alert-message">{alertConfig.message}</p>
            <button className="custom-alert-btn" onClick={closeAlert}>OK</button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <div className="page-header">
          <FaBell className="header-icon" />
          <span>Orders</span>
        </div>
      </div>

      {/* Mobile App Connection Prompt - Premium UI */}
      {!hasMobileApp && (
        <div className="mobile-connect-card">
          <h5>📱 Stay Connected</h5>
          <p>Get instant sound alerts and order notifications on your phone.</p>
          <button
            onClick={() => {
              const id = localStorage.getItem("restid");
              if (id) {
                // Determine if we are on localhost or production
                const currentOrigin = window.location.origin;
                // Path used by the mobile app to sync
                const connectUrl = `restaurantapp://register?id=${id}&url=${currentOrigin}`;

                console.log("Connecting to:", connectUrl);
                window.location.href = connectUrl;

                localStorage.setItem(`mobileConnected_${id}`, "true");
                setHasMobileApp(true);
                showCustomAlert("Connection Sent", "If the app didn't open, ensure it is installed on your phone.", "success");
              } else {
                showCustomAlert("Attention", "Please log in first", "error");
              }
            }}
            className="btn-connect-app"
          >
            Connect Mobile App
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