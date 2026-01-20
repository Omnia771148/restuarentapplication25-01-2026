'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loading from "../../loading/page";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`/api/accepted-orders/${id}`);
        setOrder(res.data.order);

        // Auto print
        setTimeout(() => window.print(), 500);
      } catch (err) {
        console.error(err);
        alert("Failed to load invoice");
      }
    };

    fetchInvoice();
  }, [id]);

  // Use your pizza loading component here
  if (!order) return <Loading />;

  return (
    <div style={{ width: "300px", fontFamily: "monospace" }}>
      <h3 style={{ textAlign: "center" }}>🍽 Restaurant Invoice</h3>
      <hr />

      <p>Order ID: {order.orderId}</p>
      <p>Date: {new Date(order.orderDate).toLocaleString()}</p>

      <hr />

      {order.items.map((item, i) => (
        <p key={i}>
          {item.name} × {item.quantity}
          <span style={{ float: "right" }}>
            ₹{item.price * item.quantity}
          </span>
        </p>
      ))}

      <hr />
      <p>
        <strong>Total</strong>
        <span style={{ float: "right" }}>₹{order.totalPrice}</span>
      </p>

      <p style={{ textAlign: "center", marginTop: "10px" }}>
        🙏 Thank you
      </p>
    </div>
  );
}