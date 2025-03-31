// script.js

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0cNURFjmI46_8HhRUJBrVzIYD7qk5NtM",
  authDomain: "age-guardian.firebaseapp.com",
  projectId: "age-guardian",
  storageBucket: "age-guardian.firebasestorage.app",
  messagingSenderId: "680759092677",
  appId: "1:680759092677:web:e8417aad409209f1ba97ac",
  measurementId: "G-BMGTHFTBBV"
};

// Initialize Firebase if not already initialized
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const condition = getUrlParameter('condition');
const participantId = getUrlParameter('participantId');

console.log('Condition:', condition);
console.log('Participant ID:', participantId);

// Create or update participant document without wiping choices
if (participantId && condition) {
  db.collection('participants').doc(participantId).get()
  .then((doc) => {
    if (doc.exists) {
      // Document exists, update condition and timestamp, keep existing choices
      db.collection('participants').doc(participantId).update({
        condition: condition,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        console.log("✅ Participant document updated (condition and timestamp).");
      })
      .catch((error) => {
        console.error("❌ Error updating participant document: ", error);
      });
    } else {
      // Document does not exist, create it with condition, timestamp, and empty choices
      db.collection('participants').doc(participantId).set({
        condition: condition,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        choices: []
      })
      .then(() => {
        console.log("✅ Participant document created.");
      })
      .catch((error) => {
        console.error("❌ Error creating participant document: ", error);
      });
    }
  })
  .catch((error) => {
    console.error("❌ Error getting participant document: ", error);
  });
}

// Redirect to the appropriate flow
function redirectBasedOnCondition(condition, participantId) {
  let redirectUrl = '';

  switch (condition) {
    case '1':
    case '3':
    case '5':
    case '6':
    case '7':
    case '8':
      redirectUrl = `fall.html?participantId=${participantId}&condition=${condition}`;
      break;
    case '2':
      redirectUrl = `govid/intro.html?participantId=${participantId}&condition=${condition}`;
      break;
    case '4':
      redirectUrl = `govid_compound/intro.html?participantId=${participantId}&condition=${condition}`;
      break;
    default:
      redirectUrl = `fall.html?participantId=${participantId}&condition=${condition}`;
  }

  window.location.href = redirectUrl;
}

// Delay and redirect
if (condition && participantId) {
  setTimeout(() => {
    redirectBasedOnCondition(condition, participantId);
  }, 3000);
}