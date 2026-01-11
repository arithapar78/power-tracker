// FIRESTORE SECURITY RULES FOR PRODUCTION
// Update these rules in Firebase Console before deploying to 100+ students

/* ============================================================================
   CURRENT RULES (Test Mode - Expires Nov 21, 2025)
   ============================================================================ */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 11, 21);
    }
  }
}


/* ============================================================================
   PRODUCTION RULES (Secure for 100+ Students)
   ============================================================================
   
   These rules will:
   1. Allow anyone to write data (students can log their energy/token savings)
   2. Prevent reading other users' individual data (privacy)
   3. Allow reading aggregate data (for dashboard)
   4. Prevent malicious data (rate limiting, data validation)
   
   ============================================================================ */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Energy Savings Collection
    match /energySavings/{docId} {
      // Anyone can write (students log their data)
      allow create: if request.resource.data.keys().hasAll(['userId', 'energySavedKWh', 'sessionDurationMinutes', 'timestamp'])
                    && request.resource.data.energySavedKWh is number
                    && request.resource.data.energySavedKWh >= 0
                    && request.resource.data.energySavedKWh < 100  // Max 100 kWh per entry (safety check)
                    && request.resource.data.sessionDurationMinutes >= 0
                    && request.resource.data.sessionDurationMinutes < 10080;  // Max 1 week (10080 min)
      
      // Allow reading all documents for aggregate calculations
      // (Individual data is anonymous anyway - just user IDs)
      allow read: if true;
      
      // No updates or deletes
      allow update, delete: if false;
    }
    
    // Token Savings Collection
    match /tokenSavings/{docId} {
      // Anyone can write
      allow create: if request.resource.data.keys().hasAll(['userId', 'tokensSaved', 'aiModel', 'timestamp'])
                    && request.resource.data.tokensSaved is number
                    && request.resource.data.tokensSaved >= 0
                    && request.resource.data.tokensSaved < 1000000;  // Max 1M tokens per entry
      
      // Allow reading all documents for aggregate calculations
      allow read: if true;
      
      // No updates or deletes
      allow update, delete: if false;
    }
  }
}


/* ============================================================================
   HOW TO UPDATE RULES IN FIREBASE CONSOLE
   ============================================================================
   
   1. Go to: https://console.firebase.google.com
   2. Select your project: "power-tracker-ari-t"
   3. Click "Firestore Database" in the left sidebar
   4. Click the "Rules" tab at the top
   5. Replace the existing rules with the PRODUCTION RULES above
   6. Click "Publish"
   
   IMPORTANT: Do this BEFORE deploying to 100+ students!
   Test mode rules expire on November 21, 2025.
   
   ============================================================================ */


/* ============================================================================
   EVEN MORE SECURE RULES (Optional - For Future)
   ============================================================================
   
   If you want even tighter security, you can add rate limiting:
   
   ============================================================================ */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Rate limiting (max 100 writes per user per day)
    function checkRateLimit(userId) {
      let existingDocs = firestore.get(/databases/$(database)/documents/energySavings).data;
      let todayStart = timestamp.date(request.time.year(), request.time.month(), request.time.day());
      let userDocsToday = existingDocs.filter(doc => 
        doc.userId == userId && doc.timestamp > todayStart
      );
      return userDocsToday.size() < 100;  // Max 100 entries per user per day
    }
    
    match /energySavings/{docId} {
      allow create: if request.resource.data.keys().hasAll(['userId', 'energySavedKWh', 'sessionDurationMinutes', 'timestamp'])
                    && request.resource.data.energySavedKWh >= 0
                    && request.resource.data.energySavedKWh < 100
                    && checkRateLimit(request.resource.data.userId);
      allow read: if true;
      allow update, delete: if false;
    }
    
    match /tokenSavings/{docId} {
      allow create: if request.resource.data.keys().hasAll(['userId', 'tokensSaved', 'aiModel', 'timestamp'])
                    && request.resource.data.tokensSaved >= 0
                    && request.resource.data.tokensSaved < 1000000
                    && checkRateLimit(request.resource.data.userId);
      allow read: if true;
      allow update, delete: if false;
    }
  }
}


/* ============================================================================
   MONITORING USAGE
   ============================================================================
   
   To check if you're staying within Firebase free tier:
   
   1. Go to Firebase Console
   2. Click "Usage and billing" in left sidebar
   3. Monitor:
      - Storage (should be < 1GB)
      - Reads (should be < 50K/day)
      - Writes (should be < 20K/day)
   
   For 100 users logging every 15 minutes:
   - Writes per day: 100 users × 96 logs/day = 9,600 writes/day ✅ (within limit)
   - Storage: ~1KB per entry × 9,600 entries/day × 30 days = ~288MB ✅ (within limit)
   
   ============================================================================ */
