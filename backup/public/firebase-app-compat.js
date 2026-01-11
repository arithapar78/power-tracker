// Firebase App Compat - Minimal inline version for Chrome extensions
// This is a simplified version that works without external CDN

// Create firebase namespace
if (typeof firebase === 'undefined') {
  self.firebase = {};
}

// Minimal Firebase App implementation
firebase.initializeApp = function(config) {
  firebase._config = config;
  firebase._app = { name: '[DEFAULT]', options: config };
  return firebase._app;
};

firebase.apps = [];
firebase.app = function() {
  return firebase._app;
};

console.log('Firebase App Compat loaded (inline)');
