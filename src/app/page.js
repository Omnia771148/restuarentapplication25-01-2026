'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restId, setRestId] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ NEW
  const router = useRouter();

  // ✅ CHECK SESSION + AUTO REDIRECT
  useEffect(() => {
    const loginTime = localStorage.getItem("loginTime");
    const storedRestId = localStorage.getItem("restid");

    if (loginTime && storedRestId) {
      const now = Date.now();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

      if (now - Number(loginTime) < SEVEN_DAYS) {
        router.push("/orders");
        return;
      } else {
        localStorage.clear();
        alert("Session expired. Please login again.");
      }
    }

    // ✅ Done checking
    setLoading(false);
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "kushas" && password === "1234") {
      localStorage.setItem("restid", "1");
      localStorage.setItem("restlocation", "https://maps.app.goo.gl/EaQzfEaVe1r1c6s18");
      localStorage.setItem("loginTime", Date.now());
      setRestId("1");
      router.push("/orders");
    } 
    else if (email === "knl" && password === "12345") {
      localStorage.setItem("restid", "2");
      localStorage.setItem("restlocation", "https://maps.app.goo.gl/hkS6Hha1cetHDUE7A");
      localStorage.setItem("loginTime", Date.now());
      setRestId("2");
      router.push("/orders");
    }
    else if (email === "sno" && password === "12345") {
      localStorage.setItem("restid", "3");
      localStorage.setItem("restlocation", "https://maps.app.goo.gl/hkS6Hha1cetHDUE7A");
      localStorage.setItem("loginTime", Date.now());
      setRestId("3");
      router.push("/orders");
    }
    else if (email === "bro" && password === "12345") {
      localStorage.setItem("restid", "5");
      localStorage.setItem("restlocation", "https://maps.app.goo.gl/hkS6Hha1cetHDUE7A");
      localStorage.setItem("loginTime", Date.now());
      setRestId("5");
      router.push("/orders");
    }
    else if (email === "lanjesh" && password === "12345") {
      localStorage.setItem("restid", "4");
      localStorage.setItem("restlocation", "https://maps.app.goo.gl/hkS6Hha1cetHDUE7A");
      localStorage.setItem("loginTime", Date.now());
      setRestId("4");
      router.push("/orders");
    } 
    else {
      alert("Invalid login");
    }
  };

  // 🔄 SHOW LOADING WHILE CHECKING SESSION
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        Checking login status...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>

        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>

      {restId && (
        <div style={{ marginTop: '20px' }}>
          <h3>Stored Rest ID: {restId}</h3>
        </div>
      )}
    </div>
  );
}
