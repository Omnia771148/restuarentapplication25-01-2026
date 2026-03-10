'use client';

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "../../loading/page";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

export default function InvoicePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div className="invoice-container">
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 1cm !important;
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .invoice-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f7eb;
          min-height: 100vh;
          font-family: 'Courier New', Courier, monospace;
          color: #000;
        }

        .invoice-card {
          background-color: white;
          padding: 30px 20px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .back-btn {
          background-color: #E6DCC8;
          border: none;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .back-btn:active {
          transform: scale(0.9);
        }

        .print-fab {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background-color: #000;
          color: #fff;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: none;
          cursor: pointer;
          z-index: 100;
        }

        .print-fab:active {
          transform: scale(0.95);
        }

        .invoice-header {
           text-align: center;
           margin-bottom: 25px;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
          font-size: 14px;
        }

        .divider {
          border: none;
          border-top: 1px dashed #7a7a7a;
          margin: 15px 0;
        }
      `}</style>

      {/* Back Button - Hidden on Print */}
      <button className="back-btn no-print" onClick={() => {
        if (source === 'restaurant') {
          router.push('/accepted-restaurants-orders');
        } else if (source === 'accepted_list') {
          router.push('/AcceptedOrdersList');
        } else {
          router.push('/dashboard');
        }
      }}>
        <FaArrowLeft />
      </button>

      <div className="invoice-card">
        <div className="invoice-header">
          <h3 style={{ margin: "0 0 10px 0" }}>
            🍽 {order.restaurantEmail || order.restaurantName || "Restaurant Invoice"}
          </h3>
          <p style={{ margin: "5px 0", fontSize: "12px" }}>
            Address: {order.address || "None"}
          </p>
          <p style={{ margin: "5px 0", fontSize: "12px" }}>
            FSSAI: {order.fssai || "None"}
          </p>
        </div>

        <div className="divider"></div>

        <p style={{ fontSize: "13px" }}><strong>Order ID: {order.orderId}</strong></p>
        <p style={{ fontSize: "13px" }}><strong>Date: {new Date(order.orderDate).toLocaleString()}</strong></p>

        <div className="divider"></div>

        <div style={{ marginBottom: "20px" }}>
          <div className="item-row" style={{ fontWeight: 'bold', fontSize: '13px', borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '10px' }}>
            <span style={{flex: 2}}>ITEM</span>
            <span style={{flex: 1, textAlign: 'center'}}>QTY</span>
            <span style={{flex: 1, textAlign: 'right'}}>PRICE</span>
          </div>
          {order.items.map((item, i) => (
            <div key={i} className="item-row">
              <span style={{flex: 2, fontWeight: 'bold'}}>{item.name}</span>
              <span style={{flex: 1, textAlign: 'center', fontWeight: 'bold'}}>{item.quantity}</span>
              <span style={{flex: 1, textAlign: 'right', fontWeight: 'bold'}}>₹{(item.price * 0.88 * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        <div className="item-row" style={{ fontSize: "18px", fontWeight: "bold" }}>
          <span>Grand Total</span>
          <span>₹{(order.totalPrice * 0.88).toFixed(2)}</span>
        </div>

        <p style={{ textAlign: "center", marginTop: "30px", fontSize: "14px", fontStyle: "italic" }}>
          🙏 Thank you for ordering!
        </p>
      </div>

      {/* Floating Print Action - Hidden on Print */}
      <button className="print-fab no-print" onClick={() => window.print()}>
        <FaPrint />
      </button>
    </div>
  );
}