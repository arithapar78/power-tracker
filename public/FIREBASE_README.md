# Firebase Database Integration - Power Tracker Extension

## ✅ Setup Complete!

Your Power Tracker extension now has Firebase Firestore integration to collect anonymous energy and token savings data from all users.

---

## 📁 New Files Added

1. **firebase-config.js** - Your Firebase project configuration
2. **firebase-manager.js** - Database operations (handles all Firestore communication)
3. **firebase-helpers.js** - Helper functions to use in popup.js and options.js
4. **FIREBASE_INTEGRATION_GUIDE.md** - Code examples for integration
5. **FIREBASE_SECURITY_RULES.md** - Security rules for production deployment
6. **test-firebase.html** - Test page to verify everything works
7. **service-worker.js** - Updated with Firebase message handlers

---

## 🚀 Quick Start Testing

### Step 1: Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select your `public/` folder
5. The extension should load successfully

### Step 2: Test Firebase Connection
1. Right-click the extension icon → "Inspect popup"
2. In the console, run:
   ```javascript
   chrome.runtime.sendMessage({
     type: 'LOG_ENERGY_SAVINGS', 
     data: {energySavedKWh: 0.01, sessionDurationMinutes: 5}
   }, (response) => console.log('Response:', response));
   ```
3. You should see: `Response: {success: true}`

### Step 3: View Data in Firebase
1. Go to https://console.firebase.google.com
2. Select project "power-tracker-ari-t"
3. Click "Firestore Database" in sidebar
4. You should see collections: `energySavings` and `tokenSavings`
5. Click on a collection to see your test data!

### Step 4: Use Test Page
1. Open `chrome-extension://[YOUR-EXTENSION-ID]/test-firebase.html`
2. Click each test button to verify functionality
3. All tests should show ✅ SUCCESS

---

## 📊 What Gets Tracked

### Energy Savings
- **userId**: Anonymous user ID (auto-generated)
- **energySavedKWh**: Energy saved in kilowatt-hours
- **sessionDurationMinutes**: How long user has been using extension
- **timestamp**: When data was logged
- **extensionVersion**: Version of extension

### Token Savings
- **userId**: Anonymous user ID
- **tokensSaved**: Number of tokens saved through optimization
- **aiModel**: AI model used (GPT-4, Claude, etc.)
- **originalTokens**: Token count before optimization
- **optimizedTokens**: Token count after optimization
- **timestamp**: When data was logged
- **extensionVersion**: Version of extension

---

## 🔧 Integration Steps

### 1. Add Helper Script to HTML Files

**In popup.html**, add before `</body>`:
```html
<script src="firebase-helpers.js"></script>
<script src="popup.js"></script>
```

**In options.html**, add before `</body>`:
```html
<script src="firebase-helpers.js"></script>
<script src="options.js"></script>
```

### 2. Log Energy Savings (Automatic)

Add to **popup.js**:
```javascript
// Track session start
if (!localStorage.getItem('sessionStartTime')) {
  localStorage.setItem('sessionStartTime', Date.now());
}

// Sync energy data every 15 minutes
async function syncEnergyData() {
  const result = await chrome.storage.local.get(['backendEnergyHistory']);
  const backendHistory = result.backendEnergyHistory || [];
  const energySavedKWh = calculateEnergySavedFromHistory(backendHistory);
  const sessionStart = parseInt(localStorage.getItem('sessionStartTime'));
  const sessionDurationMinutes = (Date.now() - sessionStart) / 1000 / 60;
  
  if (energySavedKWh > 0) {
    await logEnergySavingsToFirebase(energySavedKWh, sessionDurationMinutes);
  }
}

// Call every 15 minutes
setInterval(syncEnergyData, 900000);

// Also sync when closing
window.addEventListener('beforeunload', syncEnergyData);
```

### 3. Log Token Savings (When User Optimizes Prompt)

Add to your **prompt optimization function**:
```javascript
async function optimizePrompt(originalPrompt, aiModel) {
  // Your existing optimization code...
  const optimizedPrompt = "...your optimized prompt...";
  
  // Calculate and log token savings
  const tokenData = estimateTokenSavings(originalPrompt, optimizedPrompt);
  await logTokenSavingsToFirebase(
    tokenData.tokensSaved,
    aiModel,
    tokenData.originalTokens,
    tokenData.optimizedTokens
  );
  
  // Show user the savings
  alert(`Saved ${tokenData.tokensSaved} tokens!`);
}
```

### 4. Display School-Wide Stats

Add to **options.html**:
```html
<div class="aggregate-stats">
  <h2>🏫 Ottoson Middle School Impact</h2>
  <div class="stats-grid">
    <div class="stat">
      <span id="total-users">0</span>
      <label>Total Users</label>
    </div>
    <div class="stat">
      <span id="total-energy">0</span>
      <label>kWh Saved</label>
    </div>
    <div class="stat">
      <span id="total-tokens">0</span>
      <label>Tokens Saved</label>
    </div>
  </div>
</div>
```

Add to **options.js**:
```javascript
async function loadAggregateStats() {
  const stats = await getAggregateStatsFromFirebase();
  if (stats) {
    document.getElementById('total-users').textContent = stats.totalUsers;
    document.getElementById('total-energy').textContent = stats.totalEnergySavedKWh.toFixed(2);
    document.getElementById('total-tokens').textContent = stats.totalTokensSaved.toLocaleString();
  }
}

// Load stats when page opens
document.addEventListener('DOMContentLoaded', loadAggregateStats);
```

---

## 🔒 Security (IMPORTANT - Read Before Deploying)

### Current Status: TEST MODE
- Firebase is currently in **test mode**
- Anyone can read/write data
- **Expires: November 21, 2025**

### Before Deploying to 100+ Students:

1. Open Firebase Console: https://console.firebase.google.com
2. Select project "power-tracker-ari-t"
3. Go to "Firestore Database" → "Rules" tab
4. Copy the **PRODUCTION RULES** from `FIREBASE_SECURITY_RULES.md`
5. Replace existing rules and click "Publish"

This will:
- ✅ Allow students to log their data
- ✅ Prevent malicious data (validation rules)
- ✅ Allow reading aggregate stats
- ✅ Protect privacy (no cross-user data access)

---

## 💰 Cost & Limits

### Firebase Free Tier (Spark Plan)
- ✅ **Storage**: 1 GB (you'll use ~300 MB for 100 users)
- ✅ **Reads**: 50,000/day (you'll use ~10,000/day)
- ✅ **Writes**: 20,000/day (you'll use ~9,600/day)
- ✅ **Bandwidth**: 10 GB/month (plenty)

### Estimated Usage for 100 Students
- **Writes per day**: 100 users × 96 logs = 9,600 writes ✅
- **Storage per month**: ~288 MB ✅
- **Cost**: **$0/month** (well within free tier)

### If You Exceed Free Tier
- Paid plan starts at $0.18/GB storage
- Very unlikely with 100 users
- You can set billing alerts in Firebase Console

---

## 📈 Viewing Your Data

### Firebase Console
1. Go to https://console.firebase.google.com
2. Select "power-tracker-ari-t"
3. Click "Firestore Database"
4. Browse collections: `energySavings` and `tokenSavings`

### In Your Extension
Use the aggregate stats display (see Integration Step 4)

---

## ❓ Troubleshooting

### "Firebase not available" error
- Check: Is `firebase-config.js` loaded?
- Check: Is `firebase-manager.js` loaded?
- Check: Open `chrome://extensions/` and click "Errors" on your extension

### "Permission denied" error
- Check: Are you still in test mode? (test mode expires Nov 21, 2025)
- Solution: Update to production security rules

### No data appearing in Firebase
- Check: Open browser console (F12) and look for errors
- Test: Run the test page (`test-firebase.html`)
- Verify: Service worker is running (check in `chrome://serviceworker-internals/`)

### Service worker crashes
- Check: Look for errors in `chrome://serviceworker-internals/`
- Solution: The service worker now handles Firebase errors gracefully

---

## 🎯 Next Steps

1. ✅ Test Firebase integration using `test-firebase.html`
2. ✅ Integrate logging into your popup.js and options.js
3. ✅ Add aggregate stats display to options.html
4. ✅ Update security rules before deploying
5. ✅ Test with 5-10 users before rolling out to 100+
6. ✅ Monitor usage in Firebase Console

---

## 📞 Support

- Firebase Docs: https://firebase.google.com/docs/firestore
- Chrome Extensions: https://developer.chrome.com/docs/extensions/

---

## 🎉 You're All Set!

Your extension can now:
- ✅ Anonymously track energy savings
- ✅ Log token savings from prompt optimization
- ✅ Display school-wide impact statistics
- ✅ Scale to 100+ users without cost
- ✅ Protect user privacy

**Good luck with your deployment to Ottoson Middle School! 🏫**
