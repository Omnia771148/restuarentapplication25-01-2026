"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./loading/page";
import { FaUser, FaLock } from "react-icons/fa";
import Link from "next/link";
import "./login.css"; // Custom Styles

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("restid", data.user.restId);
        localStorage.setItem("restlocation", data.user.restLocation);
        localStorage.setItem("restaurantLocation", JSON.stringify(data.user.restaurantLocation));
        localStorage.setItem("loginTime", Date.now());
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="login-container">
      {/* Background Split Panels */}
      <div className="split-left"></div>
      <div className="split-right"></div>

      {/* Main content */}
      <div className="login-form-wrapper">

        {/* "Hello" Title */}
        <div className="title-box">
          <h1 className="title-text">Hello</h1>
        </div>

        <form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onSubmit={handleLogin}>

          {/* Mobile Number / Email Input */}
          <div className="input-group-custom">
            <div className="input-icon user-icon">
              <FaUser />
            </div>
            <input
              type="text"
              placeholder="Mobile number"
              className="form-control-custom"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="input-group-custom">
            <div className="input-icon password-icon">
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="form-control-custom"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>



          {/* Login Button */}
          <button type="submit" className="login-btn-styled" disabled={isSubmitting}>
            {isSubmitting ? "Wait" : "Login"}
          </button>

        </form>



      </div>
    </div>
  );
}
