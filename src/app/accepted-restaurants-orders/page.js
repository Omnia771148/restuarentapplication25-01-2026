'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AcceptedByRestaurantsOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurantId, setRestaurantId] = useState(null);

    useEffect(() => {
        // 1. Get restaurant ID from local storage
        const storedRestId = localStorage.getItem("restid");

        if (!storedRestId) {
            setError("No Restaurant ID found in Local Storage. Please login.");
            setLoading(false);
            return;
        }

        setRestaurantId(storedRestId);

        const fetchOrders = async () => {
            try {
                const res = await axios.get(
                    `/api/accepted-by-restaurants?restaurantId=${storedRestId}`
                );

                if (res.data.success) {
                    setOrders(res.data.orders);
                } else {
                    setError(res.data.message || "Failed to fetch orders");
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-500">
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Accepted By Restaurants Collection</h1>
                    <p className="text-gray-600 mt-2">
                        Showing orders for Restaurant ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{restaurantId}</span>
                    </p>
                </header>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-xl text-gray-500">No orders found in this collection.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Order ID</p>
                                            <p className="text-lg font-bold text-gray-800">{order.orderId}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Date</p>
                                            <p className="text-gray-800">
                                                {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-md font-semibold text-gray-700 mb-2">Customer Details</h3>
                                        <p className="text-gray-600"><span className="font-medium">Name:</span> {order.userName}</p>
                                        <p className="text-gray-600"><span className="font-medium">Phone:</span> {order.userPhone}</p>
                                    </div>

                                    <div className="mb-4 bg-gray-50 p-4 rounded-md">
                                        <h3 className="text-md font-semibold text-gray-700 mb-2">Items</h3>
                                        <ul className="divide-y divide-gray-200">
                                            {order.items.map((item, index) => (
                                                <li key={index} className="py-2 flex justify-between">
                                                    <span className="text-gray-800">
                                                        {item.quantity} x {item.name}
                                                    </span>
                                                    <span className="font-medium text-gray-800">
                                                        ₹{item.price * item.quantity}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t pt-4">
                                        <span>Total Amount</span>
                                        <span className="text-green-600">₹{order.grandTotal || order.totalPrice}</span>
                                    </div>

                                    {order.status && (
                                        <div className="mt-4 inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            Status: {order.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
