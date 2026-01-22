
import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../../lib/firebase';

const useFcmToken = () => {
    const [token, setToken] = useState(null);
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('');

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {

                    // 0. Check for Secure Context (HTTPS or Localhost)
                    if (!window.isSecureContext) {
                        setNotificationPermissionStatus('insecure');
                        console.warn("⚠️ Application is not running in a Secure Context (HTTPS/Localhost). Notifications will fail.");
                        return;
                    }

                    // Check if Push API is supported (e.g., fails in Incognito or unsupported browsers)
                    if (!('PushManager' in window)) {
                        console.error("🚫 Push Messaging is not supported in this browser (or Incognito mode).");
                        setNotificationPermissionStatus('unsupported');
                        return;
                    }

                    if (Notification.permission === 'denied') {
                        setNotificationPermissionStatus('denied');
                        console.warn("🚫 Notifications are blocked.");
                        return;
                    }

                    const msg = await messaging();
                    if (!msg) return;

                    const permission = await Notification.requestPermission();
                    setNotificationPermissionStatus(permission);

                    if (permission === 'granted') {
                        let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

                        if (!registration) {
                            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                                scope: '/'
                            });
                        }

                        // Wait for the service worker to be active
                        if (registration.installing) {
                            await new Promise((resolve) => {
                                registration.installing.addEventListener('statechange', (e) => {
                                    if (e.target.state === 'activated') resolve();
                                });
                            });
                        }

                        // 🔹 KEY FIX: Pass the specific key (vapidKey)
                        // Without this, some browsers fail to subscribe
                        const options = {
                            serviceWorkerRegistration: registration
                        };
                        if (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
                            options.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
                        }

                        const currentToken = await getToken(msg, options);

                        if (currentToken) {
                            setToken(currentToken);
                            console.log('✅ FCM Token:', currentToken);

                            const restId = localStorage.getItem('restid');
                            if (restId) {
                                await fetch('/api/save-fcm-token', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ restId, token: currentToken })
                                });
                                console.log("Token saved to backend.");
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('An error occurred while retrieving token:', error);
            }
        };

        retrieveToken();
    }, []);

    useEffect(() => {
        const setupMessageListener = async () => {
            try {
                const msg = await messaging();
                if (!msg) return;

                const unsubscribe = onMessage(msg, (payload) => {
                    console.log('Foreground message received:', payload);
                    const { title, body } = payload.notification || {};
                    if (Notification.permission === 'granted') {
                        new Notification(title, { body, icon: '/icons/icon-192x192.png' });
                    }
                });
                return () => unsubscribe && unsubscribe();
            } catch (err) {
                console.error("Message listener setup failed", err);
            }
        }
        setupMessageListener();
    }, []);

    const requestPermission = async () => {
        try {
            console.log("Requesting permission manually...");
            const permission = await Notification.requestPermission();
            setNotificationPermissionStatus(permission);
            if (permission === 'granted') {
                // Reload to trigger logic again or just call retrieveToken logic here contextually
                // For now, reload is safest to re-run full init logic
                window.location.reload();
            }
        } catch (err) {
            console.error("Manual permission request failed", err);
        }
    }

    return { token, notificationPermissionStatus, requestPermission };
};

export default useFcmToken;
