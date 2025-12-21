'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Data } from './Data'; // Adjust path if data.js is elsewhere

export default function OrdersPage() {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Get the ID from Local Storage
    const storedRestId = localStorage.getItem("restid");
    
    // Redirect to login if no ID is found (optional security)
    if (!storedRestId) {
      router.push("/"); 
      return;
    }

    setRestaurantId(storedRestId);

    // 2. Filter logic based on your requirements
    let filteredData = [];

    if (storedRestId === "1") {
      // Fetch items 1 to 4
      filteredData = Data.filter(item => item.id >= 1 && item.id <= 4);
    } 
    else if (storedRestId === "2") {
      // Fetch items 5 to 8
      filteredData = Data.filter(item => item.id >= 5 && item.id <= 8);
    } 
    else if (storedRestId === "3") {
      // Fetch items 9 to 12
      filteredData = Data.filter(item => item.id >= 9 && item.id <= 12);
    }

    setItems(filteredData);

  }, [router]);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Restaurant Dashboard</h1>
      <p>Logged in as Restaurant ID: <strong>{restaurantId}</strong></p>
      
      <hr style={{ margin: '20px 0' }}/>

      {items.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>{item.name}</h3>
              <p>Item ID: {item.id}</p>
              <p style={{ color: 'green', fontWeight: 'bold' }}>₹{item.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No items found for this Restaurant ID.</p>
      )}

      <button 
        onClick={() => {
          localStorage.clear();
          router.push("/");
        }}
        style={{ marginTop: '30px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Logout
      </button>
    </div>
  );
}