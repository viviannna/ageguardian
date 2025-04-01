// govid_script.js

// Firebase config (assuming it's already defined as in your original script)
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
} else {
  console.log("Firebase already initialized.");
}

const db = firebase.firestore();

// Parse URL parameters (assuming it's already defined as in your original script)
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

// Modified handleFormSubmit function to include the choice parameter
function handleFormSubmit(event, destination, choice) {
  event.preventDefault();
  console.log("handleFormSubmit called. Participant ID:", participantId, "Condition:", condition, "Choice:", choice);
  if (participantId && condition) {
    const participantRef = db.collection('participants').doc(participantId);
    console.log("Attempting to update document:", participantRef.path);
    const choiceData = {
      page: page,
      choice: choice,
      timestamp: firebase.firestore.Timestamp.now()
    };
    console.log("Data to add:", choiceData);

    participantRef.update({
      choices: firebase.firestore.FieldValue.arrayUnion(choiceData)
    })
      .then(() => {
        console.log("✅ Choice logged to Firestore");
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      })
      .catch((error) => {
        console.error("❌ Error logging choice:", error);
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      });
  } else {
    console.error("❌ Missing participantId or condition");
  }
}

// Generic back to page function
function handleBackToPage(event, destination) {
  if (participantId && condition) {
    const participantRef = db.collection('participants').doc(participantId);
    const choiceData = {
      page: page,
      choice: 'back',
      timestamp: firebase.firestore.Timestamp.now()
    };

    participantRef.update({
      choices: firebase.firestore.FieldValue.arrayUnion(choiceData)
    })
      .then(() => {
        console.log(`✅ Back button press logged to Firestore. Redirecting to ${destination}`);
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      })
      .catch((error) => {
        console.error(`❌ Error logging back button press to Firestore. Redirecting to ${destination}:`, error);
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      });
  } else {
    console.error("❌ Missing participantId or condition");
    window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
  }
}

// Attach button listeners (modified to handle both intro.html and photo_option.html)
document.addEventListener('DOMContentLoaded', function () {
  // For intro.html
  const photoButtonIntro = document.querySelector('#photoForm button[type="button"]');
  const alternativeButtonIntro = document.querySelector('#alternativeForm button[type="button"]');

  if (photoButtonIntro && alternativeButtonIntro) {
    photoButtonIntro.addEventListener('click', (event) =>
      handleFormSubmit(event, 'photo_option.html', 'upload_id')
    );
    alternativeButtonIntro.addEventListener('click', (event) =>
      handleFormSubmit(event, 'alternative.html', 'verify_another')
    );
  }

  // For alternative.html
  const alternativeSubmit = document.getElementById('alternative-submit');
  if (alternativeSubmit) {
    alternativeSubmit.addEventListener('click', (event) => {
      handleFormSubmit(event, 'alternative_debrief.html', 'alternative_submit');
    });
  }

  // For photo_option.html
  const scanButtonPhoto = document.getElementById('scan-button');
  const uploadButtonPhoto = document.getElementById('upload-button');
  const uploadInputPhoto = document.getElementById('upload-input');

  if (scanButtonPhoto && uploadButtonPhoto && uploadInputPhoto) {
    scanButtonPhoto.addEventListener('click', (event) => {
      handleFormSubmit(event, 'camera/camera.html', 'scan_id');
    });

    uploadButtonPhoto.addEventListener('click', function (event) {
      uploadInputPhoto.click(); // Trigger file picker
    });

    uploadInputPhoto.addEventListener('change', function (event) {
      if (this.files.length > 0) {
        handleFormSubmit(event, 'upload/loading.html', 'upload_id');
      }
    });
  }

  // Generic Back to page buttons.

  const backToIntro = document.getElementById('back-to-intro');
  if (backToIntro) {
    backToIntro.addEventListener('click', (event) => {
      handleBackToPage(event, 'intro.html');
    });
  }

  // example of back to photo option page.
  const backToPhotoOption = document.getElementById('back-to-photo-option');
  if (backToPhotoOption) {
      backToPhotoOption.addEventListener('click', (event) => {
          handleBackToPage(event, '../photo_option.html');
      });
  }

  // Check if any buttons were found
  if (!photoButtonIntro && !alternativeButtonIntro && !scanButtonPhoto && !uploadButtonPhoto && !uploadInputPhoto && !backToIntro && !alternativeSubmit) {
    console.error("❌ No relevant buttons found on this page.");
  }
});