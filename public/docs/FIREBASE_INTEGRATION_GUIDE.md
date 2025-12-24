// FIREBASE INTEGRATION GUIDE
// How to integrate Firebase data logging into your Power Tracker extension

/* ============================================================================
   STEP 1: Add firebase-helpers.js to your HTML files
   ============================================================================ */

// In popup.html, add this script tag BEFORE popup.js:
// <script src="firebase-helpers.js"></script>
// <script src="popup.js"></script>

// In options.html, add this script tag BEFORE options.js:
// <script src="firebase-helpers.js"></script>
// <script src="options.js"></script>


/* ============================================================================
   STEP 2: Log Energy Savings (Periodic Tracking)
   ============================================================================ */

// Add this to popup.js - Log energy savings every 15 minutes
async function periodicEnergySync() {
  try {
    const result = await chrome.storage.local.get(['backendEnergyHistory']);
    const backendHistory = result.backendEnergyHistory || [];
    const energySavedKWh = calculateEnergySavedFromHistory(backendHistory);
    const sessionStart = localStorage.getItem('sessionStartTime') || Date.now();
    const sessionDurationMinutes = (Date.now() - sessionStart) / 1000 / 60;
    
    if (energySavedKWh > 0) {
      await logEnergySavingsToFirebase(energySavedKWh, sessionDurationMinutes);
    }
  } catch (error) {
    console.error('Error syncing energy data:', error);
  }
}

// Call every 15 minutes: setInterval(periodicEnergySync, 900000);


/* ============================================================================
   STEP 3: Log Token Savings (Prompt Generator)
   ============================================================================ */

async function handlePromptOptimization(originalPrompt, optimizedPrompt, aiModel) {
  const tokenData = estimateTokenSavings(originalPrompt, optimizedPrompt);
  await logTokenSavingsToFirebase(
    tokenData.tokensSaved,
    aiModel || 'GPT-4',
    tokenData.originalTokens,
    tokenData.optimizedTokens
  );
}


/* ============================================================================
   STEP 4: Display Aggregate Stats
   ============================================================================ */

async function displayAggregateStats() {
  const stats = await getAggregateStatsFromFirebase();
  if (stats) {
    document.getElementById('total-users').textContent = stats.totalUsers;
    document.getElementById('total-energy').textContent = stats.totalEnergySavedKWh.toFixed(3) + ' kWh';
    document.getElementById('total-tokens').textContent = stats.totalTokensSaved.toLocaleString();
  }
}
