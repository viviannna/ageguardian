// govid_script.js

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC0cNURFjmI46_8HhRUJBrVzIYD7qk5NtM",
  authDomain: "age-guardian.firebaseapp.com",
  projectId: "age-guardian",
  storageBucket: "age-guardian.firebasestorage.app",
  messagingSenderId: "680759092677",
  appId: "1:680759092677:web:e8417aad409209f1ba97ac",
  measurementId: "G-BMGTHFTBBV"
};

// Initialize Firebase only once
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase was initialized inside govid.");
}
else {
  console.log("Firebase already initialized.");
}

const db = firebase.firestore();

// Parse URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const participantId = getUrlParameter('participantId');
const condition = getUrlParameter('condition');
const page = window.location.pathname.split('/').pop().replace('.html', '');

console.log("Participant ID:", participantId);
console.log("Condition:", condition);
console.log("Page:", page);

// Inside handleFormSubmit in govid_script.js
function handleFormSubmit(event, destination, choice) {
  event.preventDefault();
  console.log("handleFormSubmit called. Participant ID:", participantId, "Condition:", condition);
  if (participantId && condition) {
      const participantRef = db.collection('participants').doc(participantId);
      console.log("Attempting to update document:", participantRef.path);
      const choiceData = {
          page: page,
          choice: choice,
          // timestamp: new Date() // Use JS Date object (Firestore converts it)
          // OR more explicitly:
          timestamp: firebase.firestore.Timestamp.now() // Use Firestore client-side timestamp
      };
      console.log("Data to add:", choiceData);

      participantRef.update({
          choices: firebase.firestore.FieldValue.arrayUnion(choiceData) // Add the object with client timestamp
      })
      .then(() => {
          console.log("✅ Choice logged to Firestore");
          window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      })
      .catch((error) => {
          // Now you should see this error logged if something else goes wrong
          console.error("❌ Error logging choice:", error);
          window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      });
  } else {
      console.error("❌ Missing participantId or condition");
  }
}

// ✅ Attach button listeners
document.addEventListener('DOMContentLoaded', function () {
  const photoButton = document.querySelector('#photoForm button[type="button"]');
  const alternativeButton = document.querySelector('#alternativeForm button[type="button"]');

  if (photoButton && alternativeButton) {
    photoButton.addEventListener('click', (event) =>
      handleFormSubmit(event, 'photo_option.html', 'upload_id')
    );
    alternativeButton.addEventListener('click', (event) =>
      handleFormSubmit(event, 'alternative.html', 'verify_another')
    );
  } else {
    console.error("❌ One or both buttons not found.");
  }
});
