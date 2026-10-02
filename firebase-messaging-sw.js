importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBt35WXJgK4PG1_vSgEaNM-yM6_NdkJV7M",
  authDomain: "thinkora-b506e.firebaseapp.com",
  projectId: "thinkora-b506e",
  storageBucket: "thinkora-b506e.firebasestorage.app",
  messagingSenderId: "284319153584",
  appId: "1:284319153584:web:101262ae2af446c7eaea75",
  measurementId: "G-E1X99BS735"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[Thinkora] Background message received:", payload);

  const notificationTitle =
    payload.notification?.title || "Thinkora";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "You have a new update from Thinkora.",
    icon: "/favicon.svg",
    badge: "/favicon.svg"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});