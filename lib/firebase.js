
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDZ2uueufL3iXjyY2q-p1YT4III3xsZfgY",
    authDomain: "realdel-f964c.firebaseapp.com",
    projectId: "realdel-f964c",
    storageBucket: "realdel-f964c.firebasestorage.app",
    messagingSenderId: "118715949536",
    appId: "1:118715949536:web:9d37749a6c6e2346548b85",
    measurementId: "G-XGFZJKTF9D"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (Client-side only)
let analytics;
if (typeof window !== "undefined") {
    isAnalyticsSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// Initialize Messaging
const messaging = async () => {
    try {
        const isSupportedBrowser = await isSupported();
        if (isSupportedBrowser) {
            return getMessaging(app);
        }
        console.warn("Firebase Messaging not supported in this browser");
        return null;
    } catch (err) {
        console.error("Error checking messaging support", err);
        return null;
    }
};

export { app, messaging, analytics };
