"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [restId, setRestId] = useState("");
  const [restLocation, setRestLocation] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <div style={{ padding: 40 }} suppressHydrationWarning>
      <h2>Restaurant Register</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br /><br />

      <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
      <br /><br />

      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <br /><br />

      <input placeholder="Restaurant ID" onChange={(e) => setRestId(e.target.value)} />
      <br /><br />

      <input placeholder="Restaurant Location" onChange={(e) => setRestLocation(e.target.value)} />
      <br /><br />

      <button
        onClick={async () => {
          const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              phone,
              password,
              restId,
              restLocation,
            }),
          });
          const data = await res.json();
          setMsg(data.message);
        }}
      >
        Register
      </button>

      <p>{msg}</p>
    </div>
  );
}
