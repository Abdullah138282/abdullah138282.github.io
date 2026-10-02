(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyBt35WXJgK4PG1_vSgEaNM-yM6_NdkJV7M",
    authDomain: "thinkora-b506e.firebaseapp.com",
    projectId: "thinkora-b506e",
    storageBucket: "thinkora-b506e.firebasestorage.app",
    messagingSenderId: "284319153584",
    appId: "1:284319153584:web:101262ae2af446c7eaea75",
    measurementId: "G-E1X99BS735"
  };

  const vapidKey =
    "BGEiXqfJnyYkT-D1GgBRXA-Tr7xAD2HSn6vwuZfLwTZfNI1RkJxNRQu578OFKUA9hNONN5FAM6sQnMsc-VWJ28s";

  async function setupNotifications() {
    if (
      !("serviceWorker" in navigator) ||
      !("Notification" in window)
    ) {
      return;
    }

    if (!window.firebase) {
      console.error("Firebase SDK not loaded.");
      return;
    }

    if (!firebase.messaging.isSupported()) {
      console.warn("Push notifications are not supported.");
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const messaging = firebase.messaging();

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = "🔔 Enable notifications";

    button.setAttribute(
      "aria-label",
      "Enable Thinkora push notifications"
    );

    Object.assign(button.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "9999",
      padding: "12px 16px",
      border: "0",
      borderRadius: "12px",
      background: "#5a3df0",
      color: "#ffffff",
      font: "600 14px DM Sans, sans-serif",
      cursor: "pointer",
      boxShadow: "0 4px 16px rgba(0,0,0,.18)"
    });

    document.body.appendChild(button);

    button.addEventListener("click", async function () {

      button.disabled = true;
      button.textContent = "Setting up...";

      try {

        const permission =
          await Notification.requestPermission();

        if (permission !== "granted") {
          button.textContent =
            permission === "denied"
              ? "Notifications blocked"
              : "Enable notifications";

          button.disabled = false;
          return;
        }

        const token =
          await messaging.getToken({
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration
          });

        if (!token) {
          throw new Error(
            "No FCM registration token received."
          );
        }

        console.log(
          "[Thinkora] FCM token:",
          token
        );

        localStorage.setItem(
          "thinkora-notifications-enabled",
          "true"
        );

        button.textContent =
          "✓ Notifications enabled";

      } catch (error) {

        console.error(
          "[Thinkora] Notification setup failed:",
          error
        );

        button.textContent =
          "Enable notifications";

      } finally {

        button.disabled = false;

      }

    });

  }

  window.addEventListener(
    "DOMContentLoaded",
    function () {
      setupNotifications().catch(function (error) {
        console.error(
          "[Thinkora] Initialization failed:",
          error
        );
      });
    }
  );

})();