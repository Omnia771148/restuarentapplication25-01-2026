"use client";

import { useEffect, useState } from "react";
import axios from "axios";
// Import the custom pizza loading component
import Loading from "../loading/page"; 

export default function RejectedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRejectedOrders = async () => {
      try {
        const res = await axios.get("/api/rejectedorders"); // make sure your route is correct
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Error fetching rejected orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedOrders();
  }, []);

  // Updated to use the pizza loading component
  if (loading) return <Loading />;
  
  if (orders.length === 0) return <p>No rejected orders found.</p>;

  return (
    <div>
      <h1>Rejected Orders</h1>
      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        >
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Total Items:</strong> {order.totalCount}</p>
          <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
          <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <h4>Items:</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Name</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Quantity</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>{item.name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>₹{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}