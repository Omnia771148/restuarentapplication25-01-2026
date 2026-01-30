
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDZ2uueufL3iXjyY2q-p1YT4III3xsZfgY",
    authDomain: "realdel-f964c.firebaseapp.com",
    projectId: "realdel-f964c",
    storageBucket: "realdel-f964c.firebasestorage.app",
    messagingSenderId: "118715949536",
    appId: "1:118715949536:web:9d37749a6c6e2346548b85",
    measurementId: "G-XGFZJKTF9D"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'New Order';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new order!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
