"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./loading/page";
import "./login.css"; // Custom Styles

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restId, setRestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();


  // 🔒 Prevent scrolling on login page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
        // alert("Session expired. Please login again.");
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
        // Store data in localStorage
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
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="login-container">
      {/* Background Split Panels */}
      <div className="split-left"></div>
      <div className="split-right"></div>

      {/* Centered Form content */}
      <form className="login-form-wrapper" onSubmit={handleLogin}>

        {/* Title */}
        <div className="title-box">
          <h1 className="title-text">Welcome Back</h1>
        </div>

        {/* Username / Mail */}
        <span className="input-label-small">Mail Id</span>
        <div className="input-group-custom">
          {/* Email SVG Icon */}
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" width="28px" height="28px">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
          </svg>
          <input
            type="text"
            placeholder="Please enter mail id"
            className="form-control-custom"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <span className="input-label-small">Password</span>
        <div className="input-group-custom">
          {/* Lock SVG Icon */}
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" width="28px" height="28px">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3 3.1-3s3.1 1.29 3.1 3v2z" />
          </svg>
          <input
            type="password"
            placeholder="Please enter password"
            className="form-control-custom"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login Button */}
        <button type="submit" className="login-btn" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

      </form>

      {/* Footer Quote */}
      <div className="footer-quote">
        Hope your day will be great and end with good no of orders
      </div>
    </div>
  );
}
