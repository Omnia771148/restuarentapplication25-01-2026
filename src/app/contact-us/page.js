"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaEnvelope, FaPhoneAlt, FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import "./contact.css";

export default function ContactUsPage() {
    const router = useRouter();

    return (
        <div className="contact-container">
            {/* Header */}
            <div className="contact-header">
                <button onClick={() => router.back()} className="back-button">
                    <FaChevronLeft />
                </button>
                <div className="contact-title-pill">
                    <FaEnvelope />
                    <span>Contact Us</span>
                </div>
            </div>

            {/* Contact Card */}
            <div className="contact-card">
                {/* Phone */}
                <div className="contact-item">
                    <FaPhoneAlt className="contact-icon" />
                    <span className="contact-text">+91 100</span>
                </div>

                {/* Email */}
                <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <span className="contact-text">spv@gmail.com</span>
                </div>

                {/* Instagram */}
                <div className="contact-item">
                    <FaInstagram className="contact-icon" />
                    <span className="contact-text">Instagram</span>
                </div>

                {/* Facebook */}
                <div className="contact-item">
                    <FaFacebookF className="contact-icon" style={{ fontSize: '1.2rem' }} />
                    <span className="contact-text">Facebook</span>
                </div>

                {/* Twitter */}
                <div className="contact-item">
                    <FaTwitter className="contact-icon" />
                    <span className="contact-text">Twitter</span>
                </div>
            </div>
        </div>
    );
}
