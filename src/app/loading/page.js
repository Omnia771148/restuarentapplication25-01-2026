'use client';

import React, { useEffect, useState } from 'react';

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* LEEVON Logo with Orange Dot */}
        <div style={styles.logoContainer}>
          <span style={styles.dot}></span>
          <h1 className="stylish-logo">LEEVON</h1>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBar,
              left: `${progress}%`,
              transform: `translateX(-${progress}%)`
            }}
          />
        </div>

        {/* Text Group */}
        <div style={styles.textGroup}>
          <h2 style={styles.titleText}>Wait for a Second...</h2>
          <p style={styles.subtitleText}>Everything is getting ready for you</p>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Outfit:wght@300;400;600&display=swap');
        
        body {
          margin: 0;
          font-family: 'Outfit', sans-serif;
        }

        .stylish-logo {
          font-family: 'Montserrat', sans-serif;
          font-size: 38px;
          font-weight: 800;
          margin: 0;
          letter-spacing: 12px;
          text-transform: uppercase;
          line-height: 1;
          background: linear-gradient(135deg, #2c2c2c 0%, #000000 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.15));
        }
      `}</style>
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
    backgroundColor: '#FDFCF0', // Creamy off-white from image
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    maxWidth: '350px', // Increased from 260px
    padding: '20px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '35px', // Increased from 20px
    gap: '12px', // Increased from 8px
  },
  dot: {
    width: '14px', // Increased from 8px
    height: '14px', // Increased from 8px
    backgroundColor: '#FF6B00',
    borderRadius: '50%',
    display: 'inline-block',
  },
  progressBarContainer: {
    width: '240px', // Increased from 160px
    height: '4px', // Increased from 2px
    backgroundColor: '#EAEAEA',
    borderRadius: '10px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '30px', // Increased from 15px
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    width: '40px', // Increased from 25px
    backgroundColor: '#FF6B00',
    borderRadius: '10px',
    transition: 'left 0.1s linear',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px', // Increased from 4px
  },
  titleText: {
    fontSize: '24px', // Increased from 16px
    fontWeight: '600',
    color: '#1A1A1A',
    margin: 0,
  },
  subtitleText: {
    fontSize: '16px', // Increased from 12px
    color: '#888888',
    margin: 0,
    fontWeight: '400',
  },
};

