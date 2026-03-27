"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./loading/page";
import { FaUser, FaLock, FaTimes } from "react-icons/fa";
import Link from "next/link";
import "./login.css"; // Custom Styles

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const router = useRouter();


  // ✅ CHECK SESSION + AUTO REDIRECT
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoLogin = params.get("autoLogin");
    const paramEmail = params.get("email");
    const paramPassword = params.get("password");

    // 1. First priority: Auto-login from URL (if we're being redirected from office app)
    if (autoLogin === "true" && paramEmail && paramPassword) {
      setEmail(paramEmail);
      setPassword(paramPassword);
      
      const triggerLogin = async () => {
        setIsSubmitting(true);
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: paramEmail, password: paramPassword }),
          });
          const data = await response.json();
          if (data.success) {
            localStorage.setItem("restid", data.user.restId);
            localStorage.setItem("restlocation", data.user.restLocation);
            localStorage.setItem("restaurantLocation", JSON.stringify(data.user.restaurantLocation));
            localStorage.setItem("userEmail", data.user.email);
            localStorage.setItem("userPhone", data.user.phone);
            localStorage.setItem("loginTime", Date.now());
            router.push("/dashboard");
          } else {
            setErrorMsg(data.message || "Auto-login failed");
            setShowError(true);
            setIsSubmitting(false);
          }
        } catch (error) {
          console.error('Auto-login error:', error);
          setErrorMsg("Auto-login failed. Please login manually.");
          setShowError(true);
          setIsSubmitting(false);
        }
      };
      triggerLogin();
      return; // Skip session check if auto-login is happening
    }

    // 2. Second priority: Existing local session
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
    if (e) e.preventDefault();
    
    if (!email || !password) {
      setErrorMsg("Please enter both Mobile Number and Password.");
      setShowError(true);
      return;
    }

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
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userPhone", data.user.phone);
        localStorage.setItem("loginTime", Date.now());
        router.push("/dashboard");
      } else {
        setErrorMsg(data.message || "Invalid login");
        setShowError(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg("Login failed. Please try again.");
      setShowError(true);
      setIsSubmitting(false);
    }
  };

  if (loading || isSubmitting) {
    return <Loading />;
  }

  return (
    <div className="login-container">
      {/* Error Modal Overlay */}
      {showError && (
        <div className="error-modal-overlay">
          <div className="error-modal-card">
            <div className="error-modal-icon-container">
              <div className="error-red-circle">
                <FaTimes />
              </div>
            </div>
            <p className="error-modal-text">{errorMsg}</p>
            <button className="error-modal-btn" onClick={() => setShowError(false)}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Background Split Panels */}
      <div className="split-left"></div>
      <div className="split-right"></div>

      {/* Main content */}
      <div className="login-form-wrapper">

        {/* "Hello" Title */}
        <div className="title-box">
          <h1 className="title-text">LEEVON</h1>
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
              className="form-control-custom form-control-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>



          {/* Login Button */}
          <button type="submit" className="login-btn-styled" disabled={isSubmitting}>
            Login
          </button>

        </form>



      </div>
    </div>
  );
}
