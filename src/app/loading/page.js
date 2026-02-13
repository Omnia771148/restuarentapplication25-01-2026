'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Loading() {
  return (
    <div style={styles.overlay}>
      <div className="text-center">
        {/* Steam Animation */}
        <div className="steam-container">
          <div className="steam steam-1"></div>
          <div className="steam steam-2"></div>
        </div>

        {/* Biryani/Rice Bowl */}
        <div className="biryani-box">
          <span style={styles.foodEmoji}>🥘</span>
        </div>

        {/* Scrolling Text Animation */}
        <div className="mt-4">
          <h5 className="scrolling-text">Preparing Your Menu...</h5>
          <div className="progress mt-3" style={{ height: '6px', width: '220px', margin: '0 auto', borderRadius: '10px' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
              role="progressbar"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* This block injects the actual animation logic into the browser */}
        <style>
          {`
            .biryani-box {
              font-size: 80px;
              display: inline-block;
              position: relative;
              /* No spin, just sitting there looking tasty */
            }

            .steam-container {
              position: absolute;
              top: -40px;
              left: 50%;
              transform: translateX(-50%);
              width: 50px;
              height: 40px;
              display: flex;
              justify-content: center;
              gap: 10px;
              pointer-events: none;
            }

            .steam {
              width: 8px;
              height: 25px;
              background: rgba(200, 200, 200, 0.6);
              border-radius: 10px;
              animation: steamRise 2s infinite linear;
              opacity: 0;
              filter: blur(2px);
              position: relative;
            }

            .steam-1 { animation-delay: 0s; }
            .steam-2 { animation-delay: 0.8s; height: 35px; }

            .scrolling-text {
              color: #ffc107;
              font-weight: bold;
              letter-spacing: 1px;
              animation: pulseText 1.5s ease-in-out infinite;
            }

            @keyframes steamRise {
              0% { transform: translateY(0) scaleY(0.5); opacity: 0; }
              50% { opacity: 0.6; }
              100% { transform: translateY(-30px) scaleY(1.5); opacity: 0; }
            }

            @keyframes pulseText {
              0% { opacity: 0.5; transform: translateY(0px); }
              50% { opacity: 1; transform: translateY(-5px); }
              100% { opacity: 0.5; transform: translateY(0px); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  foodEmoji: {
    display: 'block',
    filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))',
    userSelect: 'none'
  }
};