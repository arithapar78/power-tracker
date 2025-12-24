// Firebase Configuration
// This file contains your Firebase project configuration

const firebaseConfig = {
  apiKey: "AIzaSyDrr6bf5Dk7EzCNHesV3laW-k1UtC_1aYY",
  authDomain: "power-tracker-ari-t.firebaseapp.com",
  projectId: "power-tracker-ari-t",
  storageBucket: "power-tracker-ari-t.firebasestorage.app",
  messagingSenderId: "709037532747",
  appId: "1:709037532747:web:4300ce78568a397d304fce",
  measurementId: "G-Y2HEEBNGS2"
};

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}
