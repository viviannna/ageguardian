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

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized");
} else {
  console.log("Firebase already initialized");
}

const db = firebase.firestore();

// Utility to read URL params
function getUrlParameter(name) {
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const participantId = getUrlParameter("participantId");
const condition = getUrlParameter("condition");
const page = window.location.pathname.split("/").pop().replace(".html", "");

console.log("Participant ID:", participantId);
console.log("Condition:", condition);
console.log("Page:", page);

// Log choice to Firestore
function handleFormSubmit(event, destination, choice) {
  event.preventDefault();
  if (participantId && condition) {
    const participantRef = db.collection("participants").doc(participantId);
    const choiceData = {
      page: page,
      choice: choice,
      timestamp: firebase.firestore.Timestamp.now()
    };

    participantRef
      .update({
        choices: firebase.firestore.FieldValue.arrayUnion(choiceData)
      })
      .then(() => {
        console.log("✅ Logged to Firestore:", choiceData);
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      })
      .catch((error) => {
        console.error("❌ Firestore log failed:", error);
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      });
  } else {
    console.error("❌ Missing participantId or condition");
  }
}

// Back button log
function handleBackToPage(event, destination) {
  if (participantId && condition) {
    const participantRef = db.collection("participants").doc(participantId);
    const choiceData = {
      page: page,
      choice: "back",
      timestamp: firebase.firestore.Timestamp.now()
    };

    participantRef
      .update({
        choices: firebase.firestore.FieldValue.arrayUnion(choiceData)
      })
      .then(() => {
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      })
      .catch((error) => {
        console.error("❌ Back log failed:", error);
        window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
      });
  } else {
    window.location.href = `${destination}?participantId=${participantId}&condition=${condition}`;
  }
}

// Event bindings
document.addEventListener("DOMContentLoaded", function () {
  // intro.html
  const photoButtonIntro = document.querySelector('#photoForm button[type="button"]');
  const alternativeButtonIntro = document.querySelector('#alternativeForm button[type="button"]');
  if (photoButtonIntro && alternativeButtonIntro) {
    photoButtonIntro.addEventListener("click", (event) =>
      handleFormSubmit(event, "photo_option.html", "upload_id")
    );
    alternativeButtonIntro.addEventListener("click", (event) =>
      handleFormSubmit(event, "alternative.html", "verify_another")
    );
  }

  // alternative.html
  const alternativeSubmit = document.getElementById("alternative-submit");
  if (alternativeSubmit) {
    alternativeSubmit.addEventListener("click", (event) => {
      handleFormSubmit(event, "alternative_debrief.html", "alternative_submit");
    });
  }

  // confirmation.html
  const govidDebriefButton = document.getElementById("govid-debrief");
  if (govidDebriefButton) {
    govidDebriefButton.addEventListener("click", (event) => {
      handleFormSubmit(event, "debrief.html", "govid_debrief");
    });
  }

  // photo_option.html
  const scanButtonPhoto = document.getElementById("scan-button");
  const uploadButtonPhoto = document.getElementById("upload-button");
  const uploadInputPhoto = document.getElementById("upload-input");
  if (scanButtonPhoto && uploadButtonPhoto && uploadInputPhoto) {
    scanButtonPhoto.addEventListener("click", (event) => {
      handleFormSubmit(event, "camera/camera.html", "scan_id");
    });
    uploadButtonPhoto.addEventListener("click", function (event) {
      uploadInputPhoto.click();
    });
    uploadInputPhoto.addEventListener("change", function (event) {
      if (this.files.length > 0) {
        handleFormSubmit(event, "upload/loading.html", "upload_id");
      }
    });
  }

  // camera.html — simulate photo capture visually
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const captureButton = document.getElementById("camera-button");

  if (video && canvas && captureButton) {
    const context = canvas.getContext("2d");

    // Open webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((err) => {
        alert("Camera access denied: " + err);
      });

    // Simulate photo effect
    captureButton.addEventListener("click", function (event) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.style.display = "block";
      video.style.display = "none";

      // Immediately log and redirect
      handleFormSubmit(event, "loading.html", "camera_button");
    });
  }

  // back buttons
  const backToIntro = document.getElementById("back-to-intro");
  if (backToIntro) {
    backToIntro.addEventListener("click", (event) => {
      handleBackToPage(event, "intro.html");
    });
  }

  const backToPhotoOption = document.getElementById("back-to-photo-option");
  if (backToPhotoOption) {
    backToPhotoOption.addEventListener("click", (event) => {
      handleBackToPage(event, "../photo_option.html");
    });
  }

  // Fallback check
  // if (!photoButtonIntro && !alternativeButtonIntro && !scanButtonPhoto && !uploadButtonPhoto && !uploadInputPhoto && !backToIntro && !alternativeSubmit && !captureButton) {
  //   console.log("ℹ️ No active listeners on this page.");
  // }

  // loading.html — log and redirect after delay
  if (page === "loading") {
    if (participantId && condition) {
      const participantRef = db.collection("participants").doc(participantId);
      const loadingLog = {
        page: page,
        choice: "loading_arrived",
        timestamp: firebase.firestore.Timestamp.now()
      };

      participantRef.update({
        choices: firebase.firestore.FieldValue.arrayUnion(loadingLog)
      }).then(() => {
        console.log("✅ Logged loading_arrived to Firestore");
        setTimeout(() => {
          window.location.href = `confirmation.html?participantId=${participantId}&condition=${condition}`;
        }, 3000);
      }).catch((err) => {
        console.error("❌ Logging error on loading.html:", err);
        window.location.href = `confirmation.html?participantId=${participantId}&condition=${condition}`;
      });
    }
  }
});
