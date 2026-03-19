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
      // Fetch items 208 to 301-------------------->k-fortune
      filteredData = Data.filter(item => item.id >= 208 && item.id <= 301);
    } 
 
    else if (storedRestId === "2") {
      // Fetch items 1 to 207   //----------------------------Amogo
      filteredData = Data.filter(item => item.id >= 1 && item.id <= 207);
    } 
   
    else if (storedRestId === "3") {
      // Fetch items 302 to 328 //--------------------------------> Mr hangouts
      filteredData = Data.filter(item => item.id >= 302 && item.id <= 328);
    }
    else if (storedRestId === "4") {
      // Fetch items 13 to 16//--------------------------->reddy familyrest
      filteredData = Data.filter(item => item.id >= 329 && item.id <= 442);
    }
    else if (storedRestId === "5") {
      // Fetch items 13 to 16--------------------------->Aha kitchens
      filteredData = Data.filter(item => item.id >= 443 && item.id <= 635);
    }
    else if (storedRestId === "6") {
      // Fetch items 13 to 16------------------------------>bro story
      filteredData = Data.filter(item => item.id >= 636 && item.id <= 700);
    }
    else if (storedRestId === "7") {
      // Fetch items 13 to 16--------------------------------->fun and food
      filteredData = Data.filter(item => item.id >= 701 && item.id <= 724);
    }
    else if (storedRestId === "8") {
      // Fetch items 13 to 16------------------------------=-->pr grand
      filteredData = Data.filter(item => item.id >= 725 && item.id <= 966);
    }
    else if (storedRestId === "9") {
      // Fetch items 13 to 16------------------------------->food land
      filteredData = Data.filter(item => item.id >= 1070 && item.id <= 1195);
    }
    else if (storedRestId === "10") {
      // Fetch items 13 to 16------------------------------>talimpu
      filteredData = Data.filter(item => item.id >= 967 && item.id <= 1069);
    }
    else if (storedRestId === "11") {
      // Fetch items 13 to 16=00000000000000000000000000000000000>>>taj darbar
      filteredData = Data.filter(item => item.id >= 1196 && item.id <= 1377);
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
          window.location.href = "/";
        }}
        style={{ marginTop: '30px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Logout
      </button>
    </div>
  );
}