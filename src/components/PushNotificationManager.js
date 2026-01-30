'use client';

import { useEffect } from 'react';
import { messaging } from '../../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';

export default function PushNotificationManager() {
    useEffect(() => {
        async function setupFirebaseNotifications() {
            try {
                const msg = await messaging();
                if (!msg) {
                    console.log('Firebase Messaging not supported');
                    return;
                }

                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied');
                    return;
                }

                // Get VAPID Key
                const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidKey) {
                    console.error('VAPID Public Key not found. Check your .env file.');
                    return;
                }

                // 1. Check if Service Worker is already registered
                let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');


                // 2. Explicitly register Service Worker
                if (!registration) {
                    try {
                        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
                        console.log('Service Worker registered explicitly:', registration);
                    } catch (swError) {
                        console.error('Service Worker registration failed:', swError);
                        return;
                    }
                }

                // Ensure it's active
                await navigator.serviceWorker.ready;


                // 3. Get FCM Token
                console.log('Requesting FCM Token...');
                const token = await getToken(msg, {
                    vapidKey,
                    serviceWorkerRegistration: registration
                });

                if (token) {
                    console.log('FCM Token received:', token);
                    await saveToken(token);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }

                // Listen for foreground messages
                onMessage(msg, (payload) => {
                    console.log('Message received. ', payload);
                    const { title, body } = payload.notification || {};
                    const notificationTitle = title || 'New Order!';
                    const notificationOptions = {
                        body: body || 'You have a new order waiting.',
                        icon: '/icons/icon-192x192.png'
                    };

                    // Show browser notification if possible (or just sound/alert)
                    new Notification(notificationTitle, notificationOptions);

                    // Optionally play sound
                    const audio = new Audio('/noti.mp3');
                    audio.play().catch(e => console.log("Audio play failed", e));
                });

            } catch (error) {
                console.error('An error occurred while retrieving token or initializing messaging:', error);
                if (error.code === 'messaging/token-subscribe-failed' || error.message.includes('401')) {
                    console.error('CRITICAL: 401 Unauthorized. This often signifies an incorrect VAPID Key. Please verify that NEXT_PUBLIC_VAPID_PUBLIC_KEY in your .env file matches the key pairs in your Firebase Console -> Project Settings -> Cloud Messaging -> Web Push Certificates.');
                }
            }
        }

        async function saveToken(token) {
            const restId = localStorage.getItem('restid');
            if (!restId) return; // Wait until logged in

            try {
                await fetch('/api/save-fcm-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        restId: restId,
                        token: token,
                    }),
                });
                console.log('FCM Token saved to server.');
            } catch (err) {
                console.error('Failed to save FCM token:', err);
            }
        }

        setupFirebaseNotifications();
    }, []);

    return null;
}
