'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./loading/page"

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restId, setRestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // ✅ CHECK SESSION + AUTO REDIRECT
  useEffect(() => {
    const loginTime = localStorage.getItem("loginTime");
    const storedRestId = localStorage.getItem("restid");

    if (loginTime && storedRestId) {
      const now = Date.now();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

      if (now - Number(loginTime) < SEVEN_DAYS) {
        router.push("/dashboard");
        return;
      } else {
        localStorage.clear();
        alert("Session expired. Please login again.");
      }
    }

    // ✅ Done checking
    setLoading(false);
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call your MongoDB API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store data in localStorage - same as your hardcoded version
        localStorage.setItem("restid", data.user.restId);
        localStorage.setItem("restlocation", data.user.restLocation);
        localStorage.setItem("loginTime", Date.now());
        setRestId(data.user.restId);
        router.push("/dashboard");
      } else {
        alert(data.message || "Invalid login");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("Login failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // 🔄 SHOW LOADING WHILE CHECKING SESSION
  if (loading || isSubmitting) {
    return <Loading />;
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
