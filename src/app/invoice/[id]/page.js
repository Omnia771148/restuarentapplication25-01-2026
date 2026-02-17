'use client';

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Loading from "../../loading/page";

export default function InvoicePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const url = source === 'restaurant'
          ? `/api/accepted-by-restaurants/${id}`
          : `/api/accepted-orders/${id}`;

        const res = await axios.get(url);
        setOrder(res.data.order);

        // Set title to remove "Next App" from print header
        document.title = "Restaurant Invoice";

        // Auto print
        setTimeout(() => window.print(), 500);
      } catch (err) {
        console.error(err);
        alert("Failed to load invoice");
      }
    };

    if (id) fetchInvoice();
  }, [id, source]);

  // Use your pizza loading component here
  if (!order) return <Loading />;

  return (
    <div style={{ width: "300px", fontFamily: "monospace" }}>
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 1cm;
          }
        }
      `}</style>
      <h3 style={{ textAlign: "center" }}>
        🍽 {order.restaurantEmail || order.restaurantName || "Restaurant Invoice"}
      </h3>
      <p style={{ textAlign: "center", margin: "5px 0", fontSize: "12px" }}>
        Address: {order.address || "None"}
      </p>
      <p style={{ textAlign: "center", margin: "5px 0", fontSize: "12px" }}>
        FSSAI: {order.fssai || "None"}
      </p>
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