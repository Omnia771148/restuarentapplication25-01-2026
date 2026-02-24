
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaStar, FaRegSurprise } from "react-icons/fa";
import "./my-reviews.css";

export default function MyReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            // Get restaurantId from localStorage
            // Assuming 'restid' is the key used for restaurant ID in other parts of the app
            const restaurantId = localStorage.getItem("restid");

            if (!restaurantId) {
                setError("Restaurant ID not found. Please login again.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/restaurant-reviews?restaurantId=${restaurantId}`);
                const data = await response.json();

                if (data.success) {
                    setReviews(data.reviews);
                } else {
                    setError(data.message || "Failed to fetch reviews");
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("An error occurred while fetching reviews");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="my-reviews-container">
            {/* Header */}
            <div className="page-header">
                <button onClick={handleBack} className="back-btn">
                    <FaArrowLeft />
                </button>
                <h1 className="page-title">My Reviews</h1>
            </div>

            {/* Content */}
            <div className="reviews-list">
                {error ? (
                    <div className="error-message" style={{ textAlign: "center", color: "red", marginTop: "20px" }}>
                        {error}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="no-reviews">
                        <FaRegSurprise className="no-reviews-icon" />
                        <p>No reviews found yet.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <div className="review-rating">
                                    <FaStar className="star-icon" />
                                    <span>{review.restaurantRating || 0}</span>
                                </div>
                                <span className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="review-text">{review.restaurantReview || "No review content."}</p>

                            {review.items && review.items.length > 0 && (
                                <div className="reviewed-items">
                                    <h4>Items Ordered</h4>
                                    <div className="item-list">
                                        {review.items.map((item, index) => (
                                            <div key={index} className="item-badge">
                                                <span className="quantity">{item.quantity}x</span>
                                                {item.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Optional: Show Restaurant ID if needed, but user said not to show Delivery Boy ID 
                  and only show particular restaurant reviews.
              */}
                            {/* <span className="restaurant-id-badge">ID: {review.restaurantId}</span> */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
