// Coaching-Dashboard/functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");

admin.initializeApp();

const db = admin.firestore();
const expo = new Expo();

/**
 * Sends a push notification to a specific device using Expo push token.
 *
 * @param {string} pushToken - The Expo push token of the user's device.
 * @param {string} message - The message to be sent in the push notification.
 */
function sendPushNotification(pushToken, message) {
  const messages = [
    {
      to: pushToken,
      sound: "default",
      body: message,
      data: { someData: "Some data" },
    },
  ];

  expo
    .sendPushNotificationsAsync(messages)
    .then((receipts) => {
      console.log("Push notifications sent:", receipts);
    })
    .catch((error) => {
      console.error("Error sending push notifications:", error);
    });
}

exports.sendInvitationNotification = functions.firestore
  .document("Invitations/{invitationId}")
  .onCreate((snap) => {
    const newInvitation = snap.data();
    const athleteEmail = newInvitation.athleteEmail;

    const usersRef = db.collection("Users");
    usersRef
      .where("email", "==", athleteEmail)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }

        snapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.expoPushToken) {
            sendPushNotification(
              userData.expoPushToken,
              "You've received a new invitation!",
            );
          }
        });
      })
      .catch((err) => {
        console.log("Error getting documents", err);
      });
  });
