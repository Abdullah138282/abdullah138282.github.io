
(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyBt35WXJgK4UP1_vSgEaNM-yM6_NdkJV7M",
    authDomain: "thinkora-b506e.firebaseapp.com",
    projectId: "thinkora-b506e",
    storageBucket: "thinkora-b506e.firebasestorage.app",
    messagingSenderId: "284319153584",
    appId: "1:284319153584:web:101262ae2af446c7eaea75",
    measurementId: "G-E1X99BS735"
  };

  const vapidKey =
    "BGEiXqfJnyYkT-D1GgBRXA-Tr7xAD2HSn6vwuZfLwTZfNI1RkJxNRQu578OFKUA9hNONN5FAM6sQnMsc-VWJ28s";

  const workerUrl =
    "https://thinkora-notifications.abdullahzahoor2525.workers.dev/";

  async function setupNotifications() {

    if (
      !("serviceWorker" in navigator) ||
      !("Notification" in window) ||
      !window.firebase
    ) {
      console.log("[Thinkora] Notifications not supported.");
      return;
    }

    if (!firebase.messaging.isSupported()) {
      console.log("[Thinkora] Firebase Messaging is not supported.");
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const messaging = firebase.messaging();

    let registration;

    try {

      registration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      await navigator.serviceWorker.ready;

      console.log(
        "[Thinkora] Service worker ready."
      );

    } catch (error) {

      console.error(
        "[Thinkora] Service worker registration failed:",
        error
      );

      return;
    }


    /* ==========================================================
       DO NOT SHOW BOX IF ALREADY ENABLED
       ========================================================== */

    if (
      localStorage.getItem(
        "thinkora-notifications-enabled"
      ) === "true"
    ) {
      console.log(
        "[Thinkora] Notifications already enabled."
      );
      return;
    }


    /* ==========================================================
       NOTIFICATION BOX
       ========================================================== */

    const box =
      document.createElement("div");

    box.className =
      "thinkora-notification-box";

    box.innerHTML = `
      <div class="thinkora-notification-icon">
        🔔
      </div>

      <div class="thinkora-notification-content">

        <strong>
          Get Thinkora updates
        </strong>

        <span>
          New articles, brain games and useful updates.
        </span>

      </div>

      <button
        type="button"
        class="thinkora-notification-button"
      >
        Enable
      </button>

      <button
        type="button"
        class="thinkora-notification-close"
        aria-label="Close notification box"
      >
        ×
      </button>
    `;

    document.body.appendChild(box);


    /* ==========================================================
       STYLES
       ========================================================== */

    const style =
      document.createElement("style");

    style.textContent = `

      .thinkora-notification-box {

        position: fixed;

        right: 20px;
        bottom: 20px;

        z-index: 9999;

        display: flex;
        align-items: center;

        gap: 12px;

        width: min(
          430px,
          calc(100vw - 32px)
        );

        padding: 14px 16px;

        background:
          var(--surface, #ffffff);

        color:
          var(--ink, #17152b);

        border:
          1px solid
          var(--line, #e6e3f0);

        border-radius: 16px;

        box-shadow:
          0 18px 45px
          rgba(28, 26, 51, 0.18);

      }


      .thinkora-notification-icon {

        width: 40px;
        height: 40px;

        flex: 0 0 40px;

        display: flex;

        align-items: center;
        justify-content: center;

        border-radius: 12px;

        background:
          var(--violet-tint, #f0edff);

        font-size: 20px;

      }


      .thinkora-notification-content {

        display: flex;

        flex-direction: column;

        gap: 3px;

        min-width: 0;

        flex: 1;

      }


      .thinkora-notification-content strong {

        font:
          700 14px
          var(
            --font-body,
            "DM Sans",
            sans-serif
          );

      }


      .thinkora-notification-content span {

        font:
          400 12px
          var(
            --font-body,
            "DM Sans",
            sans-serif
          );

        color:
          var(
            --ink-soft,
            #66627a
          );

        line-height: 1.4;

      }


      .thinkora-notification-button {

        flex: 0 0 auto;

        padding: 9px 13px;

        border: 0;

        border-radius: 10px;

        background:
          var(
            --violet,
            #5a3df0
          );

        color: #ffffff;

        font:
          700 13px
          var(
            --font-body,
            "DM Sans",
            sans-serif
          );

        cursor: pointer;

        white-space: nowrap;

      }


      .thinkora-notification-button:hover {
        opacity: 0.9;
      }


      .thinkora-notification-button:disabled {

        opacity: 0.6;

        cursor: default;

      }


      .thinkora-notification-close {

        position: absolute;

        top: 5px;
        right: 7px;

        width: 24px;
        height: 24px;

        padding: 0;

        border: 0;

        background: transparent;

        color:
          var(
            --ink-soft,
            #66627a
          );

        font-size: 20px;

        line-height: 1;

        cursor: pointer;

      }


      @media (max-width: 600px) {

        .thinkora-notification-box {

          right: 12px;
          bottom: 12px;

          width:
            calc(100vw - 24px);

          padding: 13px 14px;

        }

        .thinkora-notification-content span {

          font-size: 11px;

        }

        .thinkora-notification-button {

          padding: 9px 11px;

        }

      }

    `;

    document.head.appendChild(style);


    const button =
      box.querySelector(
        ".thinkora-notification-button"
      );

    const closeButton =
      box.querySelector(
        ".thinkora-notification-close"
      );


    /* ==========================================================
       CLOSE
       ========================================================== */

    closeButton.addEventListener(
      "click",
      function () {

        box.remove();

        localStorage.setItem(
          "thinkora-notification-dismissed",
          "true"
        );

      }
    );


    /* ==========================================================
       ENABLE
       ========================================================== */

    button.addEventListener(
      "click",
      async function () {

        button.disabled = true;

        button.textContent =
          "Setting up...";


        try {

          /* ----------------------------------------------------
             REQUEST PERMISSION
             ---------------------------------------------------- */

          const permission =
            await Notification.requestPermission();


          if (permission !== "granted") {

            button.disabled = false;

            button.textContent =
              permission === "denied"
                ? "Blocked"
                : "Enable";

            console.log(
              "[Thinkora] Notification permission:",
              permission
            );

            return;
          }


          /* ----------------------------------------------------
             GET FCM TOKEN
             ---------------------------------------------------- */

          const token =
            await messaging.getToken({

              vapidKey:
                vapidKey,

              serviceWorkerRegistration:
                registration

            });


          if (!token) {

            throw new Error(
              "No FCM registration token received."
            );

          }


          console.log(
            "[Thinkora] FCM token received."
          );


          /* ----------------------------------------------------
             SEND TOKEN TO CLOUDFLARE WORKER
             ---------------------------------------------------- */

          const response =
            await fetch(
              workerUrl,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify({
                    token: token
                  })
              }
            );


          const responseText =
            await response.text();


          console.log(
            "[Thinkora] Worker status:",
            response.status
          );


          console.log(
            "[Thinkora] Worker response:",
            responseText
          );


          /* ----------------------------------------------------
             IMPORTANT:
             DO NOT SAY ENABLED IF WORKER FAILED
             ---------------------------------------------------- */

          if (!response.ok) {

            throw new Error(
              "Worker returned HTTP " +
              response.status +
              ": " +
              responseText
            );

          }


          let result = null;

          try {

            result =
              JSON.parse(
                responseText
              );

          } catch (error) {

            /* Response may not be JSON */

          }


          if (
            result &&
            result.success === false
          ) {

            throw new Error(
              result.error ||
              "Worker rejected the request."
            );

          }


          /* ----------------------------------------------------
             SUCCESS
             ---------------------------------------------------- */

          localStorage.setItem(
            "thinkora-notifications-enabled",
            "true"
          );


          box.innerHTML = `

            <div class="thinkora-notification-icon">
              ✓
            </div>

            <div class="thinkora-notification-content">

              <strong>
                Notifications enabled
              </strong>

              <span>
                You'll receive Thinkora updates here.
              </span>

            </div>

            <button
              type="button"
              class="thinkora-notification-close"
              aria-label="Close notification box"
            >
              ×
            </button>

          `;


          box.querySelector(
            ".thinkora-notification-close"
          ).addEventListener(
            "click",
            function () {
              box.remove();
            }
          );


          console.log(
            "[Thinkora] Notifications enabled successfully."
          );


        } catch (error) {

          console.error(
            "[Thinkora] Notification setup failed:",
            error
          );


          button.disabled = false;

          button.textContent =
            "Try again";

        }

      }
    );

  }


  /* ============================================================
     START
     ============================================================ */

  window.addEventListener(
    "DOMContentLoaded",
    function () {

      setupNotifications()
        .catch(
          function (error) {

            console.error(
              "[Thinkora] Notification initialization failed:",
              error
            );

          }
        );

    }
  );

})();

