
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaStar, FaRegSurprise } from "react-icons/fa";
import Loading from "../loading/page";
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
        return <Loading />;
    }


    return (
        <div className="my-reviews-container">
            {/* Header */}
            <div className="orders-header">
                <button onClick={handleBack} className="back-button">
                    <FaArrowLeft />
                </button>
                <div className="header-title-pill">
                    <FaStar className="header-icon" style={{color: '#4CAF50'}} />
                    <span>My Reviews</span>
                </div>
            </div>

            {/* Content */}
            <div className="reviews-list">
                {error ? (
                    <div className="text-center mt-5">
                        <div className="error-message d-inline-block">
                            {error}
                        </div>
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

                            <p className="review-text">&quot;{review.restaurantReview || "No review content."}&quot;</p>

                            {review.items && review.items.length > 0 && (
                                <div className="reviewed-items">
                                    <h4>Items Ordered</h4>
                                    <div className="item-list">
                                        {review.items.map((item, index) => (
                                            <div key={index} className="item-badge">
                                                <span className="quantity">{item.quantity}</span>
                                                {item.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
